var InputNumberView = require('../ampersand-input-number-step-view');
var FormView = require('ampersand-form-view');
var domready = require('domready');

var TestForm = FormView.extend({
  fields: function () {
    return [
      new InputNumberView({
        label: 'Enter a number',
        name: 'test_number',
        placeholder: 'Number',
        parent: this,
        step: 1,
        min: 0,
        max: 10
      })
    ];
  }
});

domready(function() {
  var form = new TestForm({
    el: document.querySelector('form'),
    submitCallback: function (data) {
      console.log(data);
    }
  });

  form.render();
});