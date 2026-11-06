require "rails_helper"

RSpec.describe ReviewRequestJob, type: :job do
  include ActiveJob::TestHelper

  let(:bundle_a) { create(:bundle, name_hr: "Paket za spavanje", name_en: "Sleeping bundle", position: 1) }
  let(:bundle_b) { create(:bundle, name_hr: "Paket za kupanje", name_en: "Bath bundle", position: 2) }
  let(:order) do
    create(:order, status: :delivered, language: :en, customer_email: "parent@example.com").tap do |o|
      [ bundle_a, bundle_b ].each do |b|
        o.order_items.create!(bundle: b, bundle_name: b.name_hr, quantity: 1, unit_price: b.price, line_total: b.price)
      end
    end
  end

  before { ActionMailer::Base.deliveries.clear }

  it "creates one review request per bundle and emails a link for each, in the order's language" do
    expect { described_class.perform_now(order.id) }.to change(Review, :count).by(2)

    mail = ActionMailer::Base.deliveries.last
    expect(ActionMailer::Base.deliveries.size).to eq(1)
    expect(mail.to).to eq([ "parent@example.com" ])
    expect(mail.subject).to include("How do you like")
    Review.where(order: order).find_each do |review|
      expect(mail.html_part&.body&.to_s || mail.body.to_s).to include("/en/review/#{review.token}/")
    end
    expect(mail.text_part.body.to_s).to include("Sleeping bundle")
  end

  it "writes Croatian email for Croatian orders" do
    order.update!(language: :hr)
    described_class.perform_now(order.id)

    expect(ActionMailer::Base.deliveries.last.subject).to include("Kako vam se sviđa")
    expect(ActionMailer::Base.deliveries.last.text_part.body.to_s).to include("/hr/review/")
  end

  it "is idempotent" do
    described_class.perform_now(order.id)
    expect { described_class.perform_now(order.id) }.not_to change(Review, :count)
    expect(ActionMailer::Base.deliveries.size).to eq(1)
  end

  it "does nothing for orders that are not delivered" do
    order.update!(status: :refunded)
    expect { described_class.perform_now(order.id) }.not_to change(Review, :count)
    expect(ActionMailer::Base.deliveries).to be_empty
  end

  it "leaves no review rows when the email fails" do
    allow(ReviewMailer).to receive(:request_review).and_raise(Net::SMTPFatalError.new("boom"))
    expect { described_class.perform_now(order.id) }.to raise_error(Net::SMTPFatalError)
    expect(Review.count).to eq(0)
  end
end

RSpec.describe ScheduleReviewRequestsJob, type: :job do
  include ActiveJob::TestHelper

  def delivered_order(delivered_ago)
    create(:order, :with_items, status: :delivered).tap do |o|
      o.order_status_transitions.create!(from_status: :shipped, to_status: :delivered, created_at: delivered_ago.ago)
    end
  end

  it "enqueues a request for orders delivered 7 days ago (default) and skips the rest" do
    due = delivered_order(8.days)
    too_recent = delivered_order(2.days)
    too_old = delivered_order(40.days)
    already_asked = delivered_order(8.days)
    create(:review, order: already_asked, bundle: already_asked.order_items.first.bundle)

    expect { described_class.perform_now }.to have_enqueued_job(ReviewRequestJob).with(due.id).exactly(:once)
    expect(ReviewRequestJob).not_to have_been_enqueued.with(too_recent.id)
    expect(ReviewRequestJob).not_to have_been_enqueued.with(too_old.id)
    expect(ReviewRequestJob).not_to have_been_enqueued.with(already_asked.id)
  end

  it "reads the delay from REVIEW_REQUEST_DELAY_DAYS" do
    order = delivered_order(3.days)
    previous = ENV["REVIEW_REQUEST_DELAY_DAYS"]
    ENV["REVIEW_REQUEST_DELAY_DAYS"] = "2"
    expect { described_class.perform_now }.to have_enqueued_job(ReviewRequestJob).with(order.id)
  ensure
    ENV["REVIEW_REQUEST_DELAY_DAYS"] = previous
  end
end
