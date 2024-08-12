const MAX_CHARS = 150;
const formEl = document.querySelector(".form");
const textAreaEl = document.querySelector(".form__textarea");
const counterEl = document.querySelector(".counter");
const feedbackListEl = document.querySelector(".feedbacks");
const submitBtnEL = document.querySelector(".submit-btn");
const spinnerEL = document.querySelector(".spinner");
const BASE_API_URL = "https://bytegrad.com/course-assets/js/1/api";
const hastagListEl = document.querySelector(".hashtags");

const renderFeedbackItem = (feedbackItem) => {
  const feedbackItemHTML = `
<li class="feedback">
  <button class="upvote">
      <i class="fa-solid fa-caret-up upvote__icon"></i>
      <span class="upvote__count">${feedbackItem.upvoteCount}</span>
  </button>
  <section class="feedback__badge">
      <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
  </section>
  <div class="feedback__content">
      <p class="feedback__company">${feedbackItem.company}</p>
      <p class="feedback__text">${feedbackItem.text}</p>
  </div>
  <p class="feedback__date">${
    feedbackItem.daysAgo === 0 ? "NEW" : `${feedbackItem.daysAgo}d`
  }</p>
</li>
`;

  return feedbackItemHTML;
};

//--Counter Component--//
(() => {
  textAreaEl.addEventListener("input", () => {
    counterEl.textContent = MAX_CHARS - textAreaEl.value.length;
  });
})();

//--Form Component--//

(() => {
  const showVisualIndicator = (validation) => {
    formEl.classList.add(`form--${validation}`);

    setTimeout(() => {
      formEl.classList.remove(`form--${validation}`);
    }, 2000);
  };

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = textAreaEl.value;

    if (text.includes("#") && text.length > 4) {
      showVisualIndicator("valid");
    } else {
      showVisualIndicator("invalid");

      textAreaEl.focus();

      return;
    }
    //--Load List Component--//

    //Load Data

    const hashtag = text.split(" ").find((word) => word.includes("#"));
    const company = hashtag.substring(1);
    const badgeLetter = company.substring(0, 1).toUpperCase();
    const upvoteCount = 0;
    const daysAgo = 0;
  

    const feedbackItem = {
      hashtag: hashtag,
      company: company,
      badgeLetter: badgeLetter,
      upvoteCount: upvoteCount,
      daysAgo: daysAgo,
      text: text,
    };

    //New Feedback Item

    const feedbackItemHTML = renderFeedbackItem(feedbackItem);

    //Post Data
    const postFeedback = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/feedbacks`, {
          method: "POST",
          body: JSON.stringify(feedbackItem),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.log(`Something went wrong:  ${res}`);
          return;
        }
      } catch (error) {
        console.log(`Failed to post feedback. Error: ${error}`);
      }
      console.log(`Data Sucessfully Posted: ${res}`);
    };

    postFeedback();

    //Insert Feedback Item, clear fields
    textAreaEl.value = "";
    submitBtnEL.blur();
    counterEl.textContent = MAX_CHARS;
    feedbackListEl.insertAdjacentHTML("beforeend", feedbackItemHTML);
  });
})();

//--Feedback list--//
(() => {
  feedbackListEl.addEventListener("click", (e) => {
    const clickedEL = e.target;

    const upvoteIntention = clickedEL.className.includes("upvote");

    if (upvoteIntention) {
      const upvoteBtnEL = clickedEL.closest(".upvote");
      upvoteBtnEL.disabled = true;

      const upvoteCountEL = upvoteBtnEL.querySelector(".upvote__count");

      let upvoteCount = +upvoteCountEL.textContent;

      upvoteCountEL.textContent = ++upvoteCount;
    } else {
      clickedEL.closest(".feedback").classList.toggle("feedback--expand");
    }
  });

  const FeedbackList = async () => {
    //Fetch Data
    try {
      const res = await fetch(`${BASE_API_URL}/feedbacks`);
      const data = await res.json();

      if (!res.ok) {
        console.log(data);
        return;
      }
      //Display Data
      console.log(data);
      spinnerEL.remove();

      data.feedbacks.forEach((feedbackItem) => {
        const feedbackItemHTML = renderFeedbackItem(feedbackItem);

        feedbackListEl.insertAdjacentHTML("beforeend", feedbackItemHTML);
      });
    } catch (error) {
      feedbackListEl.textContent = `failed to fetch feedback items. Error message: ${error}`;
    }
  };

  FeedbackList();
})();

//--Hashtag-List--//
(() => {
  hastagListEl.addEventListener("click", (e) => {
    const clickedEL = e.target;
    if (clickedEL.className === "hashtags") {
      return;
    } else {
      const hashtagText = clickedEL.textContent
        .substring(1)
        .toLowerCase()
        .trim();
      console.log(hashtagText);
      feedbackListEl.childNodes.forEach((node) => {
        if (node.nodeType === 3) return;
        const feedbackCompanyname = node
          .querySelector(".feedback__company")
          .textContent.toLowerCase()
          .trim();

        if (hashtagText !== feedbackCompanyname) {
          node.remove();
        }
      });
    }
  });
})();
