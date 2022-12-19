'use strict';

/* Array.prototype.filter */
const arr = [12, 5, 8, 130, 44];

const isBigEnough = function (value) {
  // If true is returned then the element should exist
  return value >= 10; //true
  // If false is returned then the element will be filtered out
};

// It can be used to return all prime numbers in an array
const array = [
  -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  19, 20,
];

const isPrime = function (num) {
  for (let i = 2; num > i; i++) {
    if (num % i === 0) {
      return false;
    }
  }
  return num > 1;
};
// console.log(array.filter(isPrime));

// Affecting initial array(modifying ,appending,deleting)

let words = ['spray', 'limit', 'exuberant', 'destruction', 'elite', 'present'];

const modifiedWords = words.filter((word, index, arr) => {
  arr[index + 1] += 'extra';
  return word.length < 6;
});

//Searching in array
const fruits = ['apple', 'banana', 'grapes', 'mango', 'orange'];

function filterItems(arr, query) {
  return arr.filter((el) => el.toLowerCase().includes(query.toLowerCase()));
}

// console.log(filterItems(fruits, 'an'));

//Reduce method
const numb = [1, 1, 2, 3, 4];
// console.log(numb.reduce((a, b) => a + b));
const arr1 = [1, 2, 7];
// console.log(numb.filter((x) => !arr1.includes(x)));
// console.log(typeof Number(!0));

// Class are special function for storing data and its code

//Class declaration
/*
class Rectangle {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
}

// Unlike function declaration, classes must be defined before they can be constructed

//Class expression
let Rectangle1 = class {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
};
*/
