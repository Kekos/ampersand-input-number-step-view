var AmpInputView = require('ampersand-input-view');

var NumberStepView = AmpInputView.extend({
  template: [
        '<label>',
            '<span data-hook="label"></span>',
            '<input class="form-input">',
            '<button type="button" class="form-input-modifier" data-hook="step-up">+</button>',
            '<button type="button" class="form-input-modifier" data-hook="step-down">-</button>',
            '<div data-hook="message-container" class="message message-below message-error">',
                '<p data-hook="message-text"></p>',
            '</div>',
        '</label>'
    ].join(''),

  events: {
    'click [data-hook=step-up]': 'stepUp',
    'click [data-hook=step-down]': 'stepDown'
  },

  props: {
    step: ['number', true, 1],
    min: ['number', false, undefined],
    max: ['number', false, undefined]
  },

  initialize: function (spec) {
    spec || (spec = {});

    if (spec.step) {
      this.step = spec.step;
    }

    if (spec.min) {
      this.min = spec.min;
    }

    if (spec.max) {
      this.max = spec.max;
    }

    AmpInputView.prototype.initialize.apply(this);
  },

  render: function() {
    // Render
    this.renderWithTemplate(this);
    this.input = this.query('input') || this.query('textarea');
    this.input.type = 'number';
    this.input.step = this.step;
    this.initInputBindings();

    // Skip validation on initial setValue
    // if the field is not required
    this.setValue(this.inputValue, !this.required);

    return this;
  },

  stepUp: function() {
    var new_val = (parseFloat(this.value) || 0) + this.step;

    if (new_val <= this.max || this.max === undefined) {
      this.setValue(new_val);
    }
  },

  stepDown: function() {
    var new_val = parseFloat(this.value) - this.step;

    if (new_val >= this.min || this.min === undefined) {
      this.setValue(new_val);
    }
  }
});

module.exports = NumberStepView;