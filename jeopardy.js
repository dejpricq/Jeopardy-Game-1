const $startButton = document.getElementById('start');
const $restartButton = document.getElementById('start');
const $jeopardyTable = document.getElementById('jeopardy');

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
$(document).ready(function() {
  const NUM_CATEGORIES = 6;
  const NUM_QUESTIONS_PER_CAT = 2;
  const $jeopardyTable = $('#jeopardy');
  const $startButton = $('#start');
  const $restartButton = $('#restart');
  let categories = [];
})

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds() {
  try {
    const response = await axios.get(`http://jservice.io/api/categories?count=${NUM_CATEGORIES}`);
    const categoryIds = response.data.map(category => category.id);
    return categoryIds;
  } catch (error) {
    console.error('Error fetching category ids:', error);
  }
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null, value: 200},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null, value: 400},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  try{
      const response = await axios.get(`http://jservice.io/api/category?id=${catId}`);
      const category = {
        title: response.data.title,
        clues: response.data.clues.map(clue => ({
          question: clue.question,
          answer: clue.answer,
          showing: null
        }))
      };
      return category;
  }
  catch(error) {
      console.error('Error fetching category:', error);
  }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  $jeopardyTable.empty();
  const $thead = $('<thead>').appendTo($jeopardyTable);
  const $trHead = $('<tr>').appendTo($thead);

  for (let category of categories) {
      $('<td>').text(category.title).appendTo($trHead);
  }
  const $tbody = $('<tbody>').appendTo($jeopardyTable);

  for(let i=0; i< NUM_QUESTIONS_PER_CAT; i++){
      const $trBody = $('<tr>').appendTo($tbody);

  for (let j=0; j < NUM_CATEGORIES; j++){
      const $td = $('<td>').addClass('question').attr('data-cat', j).attr('data-clue', i).text('?').appendTo($trBody);
  }
  }
}
  // Add row with headers for categories

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  const $target = $(evt.target);
  const catIndex = $target.data('cat');
  const clueIndex = $target.data('clue');
  const clue = categories[catIndex].clues[clueIndex];
  
  if (clue.showing === null) {
      $target.text(clue.question);
      clue.showing ='question';
  }
   else if (clue.showing === 'question'){
      $target.text(clue.answer).addClass('answer');
      clue.showing = 'answer';
   }
  }

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  // clear the board
  $("#jeopardy thead").empty();
  $("#jeopardy tbody").empty();

  // show the loading icon
  $("#spin-container").show();
  $("#start")
    .addClass("disabled")
    .text("Loading...");
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $("#start")
    .removeClass("disabled")
    .text("Restart!");
  $("#spin-container").hide();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  showLoadingView();

  const categoryIds = await getCategoryIds();
  categories = await Promise.all(categoryIds.map(getCategory));

  fillTable();
  hideLoadingView();
}

/** On click of start / restart button, set up game. */

$startButton.click(setupAndStart);
$restartButton.click(setupAndStart);

/** On page load, add event handler for clicking clues */

// $start.addEventListener('click', setupAndStart);
