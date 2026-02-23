const express = require('express');
const { postAReview, getuserReview, getTotalReviewsCount } = require('./review.controller');

const router = express.Router();

//post a review
router.post('/post-review', postAReview);

// review counts
router.get('/total-reviews', getTotalReviewsCount);

//get review data for user
router.get('/:userId', getuserReview);





module.exports = router;