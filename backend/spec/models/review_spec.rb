require "rails_helper"

RSpec.describe Review, type: :model do
  let(:order) { create(:order, :with_items, status: :delivered, shipping_first_name: "Ana Marija", shipping_last_name: "kovač") }
  let(:bundle) { order.order_items.first.bundle }

  describe ".build_request" do
    it "creates an unsubmitted pending review with a unique token that expires in 60 days" do
      review = Review.build_request(order, bundle)
      review.save!

      expect(review.token).to be_present
      expect(review.token.length).to be >= 40
      expect(review.token_expires_at).to be_within(1.minute).of(60.days.from_now)
      expect(review).to be_pending
      expect(review).not_to be_submitted
      expect(review.token_state).to eq(:open)
    end

    it "uses the order's language and first name + last initial" do
      order.update!(language: :en)
      review = Review.build_request(order, bundle)

      expect(review.locale).to eq("en")
      expect(review.author_display_name).to eq("Ana K.")
    end
  end

  describe "validations" do
    it "allows one review per order and bundle" do
      Review.build_request(order, bundle).save!
      duplicate = Review.build_request(order, bundle)

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:bundle_id]).to be_present
    end

    it "does not require rating or body before submission" do
      expect(Review.build_request(order, bundle)).to be_valid
    end

    it "requires a rating between 1 and 5 once submitted" do
      review = create(:review)
      [ 0, 6, nil, "4.5" ].each do |rating|
        expect(review.submit(rating: rating, title: "", body: "Dovoljno dug tekst recenzije.")).to be(false), "rating #{rating.inspect}"
        expect(review.errors[:rating]).to be_present
      end
      expect(review.submit(rating: 4, title: "", body: "Dovoljno dug tekst recenzije.")).to be(true)
    end

    it "requires a body of 10 to 2000 characters and a title up to 120" do
      review = create(:review)
      expect(review.submit(rating: 5, title: "", body: "Kratko")).to be(false)
      expect(review.errors[:body]).to be_present
      expect(review.submit(rating: 5, title: "x" * 121, body: "Dovoljno dug tekst recenzije.")).to be(false)
      expect(review.errors[:title]).to be_present
      expect(review.submit(rating: 5, title: "x" * 120, body: "y" * 2001)).to be(false)
    end

    it "leaves the token unused when submission fails" do
      review = create(:review)
      review.submit(rating: 9, title: "", body: "")

      expect(review.reload.token_state).to eq(:open)
    end

    it "cannot be approved before it is submitted" do
      review = create(:review)
      expect { review.approve! }.to raise_error(ActiveRecord::RecordInvalid)
    end
  end

  describe "#token_state" do
    it "is :expired after the expiry time and :used after submission" do
      expect(build(:review, :expired).token_state).to eq(:expired)
      expect(build(:review, :submitted).token_state).to eq(:used)
    end
  end

  describe ".summary_for" do
    it "averages approved reviews only" do
      create(:review, :approved, bundle: bundle, rating: 5)
      create(:review, :approved, bundle: bundle, rating: 4)
      create(:review, :submitted, bundle: bundle, rating: 1)
      create(:review, :rejected, bundle: bundle, rating: 1)

      expect(Review.summary_for(bundle)).to eq(count: 2, average_rating: 4.5)
    end

    it "returns no average without approved reviews" do
      expect(Review.summary_for(bundle)).to eq(count: 0, average_rating: nil)
    end
  end
end
