/*
* @Author: yglin
* @Date:   2016-08-01 11:24:57
* @Last Modified by:   yglin
* @Last Modified time: 2016-08-02 17:57:15
*/

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Place Schema
 */
var PlaceSchma = new Schema({
  address: {
    type: String,
    default: '',
    trim: true,
    index: true,
    required: '請填入地址'
  },
  location: {
    type: [Number],
    index: '2dsphere'
  }
});

mongoose.model('Place', PlaceSchma);
