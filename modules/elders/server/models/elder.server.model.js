'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Elder Schema
 */
var ElderSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  _creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  serial_no: Number,
  name: {
    type: String,
    default: '',
    trim: true,
    required: '請填入姓名'
  },
  gender: {
    type: String,
    enum: {
      values: ['M', 'F'],
      message: '請選擇 M - 男性, 或是 F - 女性'
    }
  },
  birthday: Date,
  phone: String,
  emergency_contact: {
    name: String,
    relationship: String,
    phone: String
  },
  _residence: {
    type: Schema.ObjectId,
    ref: 'Place',
    index: true
  }
});

mongoose.model('Elder', ElderSchema);
