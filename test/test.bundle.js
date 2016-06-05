(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/ampersand-input-number-step-view.js":[function(require,module,exports){
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
},{"ampersand-input-view":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/ampersand-input-view.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/ampersand-form-view.js":[function(require,module,exports){
;if (typeof window !== "undefined") {  window.ampersand = window.ampersand || {};  window.ampersand["ampersand-form-view"] = window.ampersand["ampersand-form-view"] || [];  window.ampersand["ampersand-form-view"].push("6.0.0");}
var View = require('ampersand-view');
var set = require('lodash.set');
var isFunction = require('lodash.isfunction');
var result = require('lodash.result');

module.exports = View.extend({

    session: {
        valid: ['boolean', false, false]
    },

    derived: {
        data: {
            fn: function () {
                var res = {};
                for (var key in this._fieldViews) {
                    if (this._fieldViews.hasOwnProperty(key)) {
                        // If field name ends with '[]', don't interpret
                        // as verbose form field...
                        if (key.match(/\[\]$/)) {
                            res[key] = this._fieldViews[key].value;
                        } else {
                            set(res, key, this._fieldViews[key].value);
                        }
                    }
                }
                return this.clean(res);
            },
            cache: false
        }
    },

    initialize: function(opts) {
        opts = opts || {};
        this.el = opts.el;
        this.validCallback = opts.validCallback || this.validCallback;
        this.submitCallback = opts.submitCallback || this.submitCallback;
        this.clean = opts.clean || this.clean || function (res) { return res; };

        if (opts.model) this.model = opts.model;

        this.preventDefault = opts.preventDefault === false ? false : true;
        this.autoAppend = opts.autoAppend === false ? false : true;

        // storage for our fields
        this._fieldViews = {};
        this._fieldViewsArray = [];

        // add all our fields
        (result(opts, 'fields') || result(this, 'fields') || []).forEach(this.addField, this);

        if (opts.autoRender) {
            this.autoRender = opts.autoRender;
            // &-view requires this.template && this.autoRender to be truthy in
            // order to autoRender. template doesn't apply to &-form-view, but
            // we manually flip the bit to honor autoRender
            this.template = opts.template || this.template || true;
        }

        if (opts.values) this._startingValues = opts.values;

        if (this.validCallback) {
            this.on('change:valid', function(view, validBool) {
                this.validCallback(validBool);
            });
        }

        if (this.submitCallback) this.on('submit', this.submitCallback);
    },

    addField: function (fieldView) {
        this._fieldViews[fieldView.name] = fieldView;
        this._fieldViewsArray.push(fieldView);
        return this;
    },

    removeField: function (name, strict) {
        var field = this.getField(name, strict);
        if (field) {
            field.remove();
            delete this._fieldViews[name];
            this._fieldViewsArray.splice(this._fieldViewsArray.indexOf(field), 1);
        }
    },

    getField: function (name, strict) {
        var field = this._fieldViews[name];
        if (!field && strict) {
            throw new ReferenceError('field name  "' + name + '" not found');
        }
        return field;
    },

    setValues: function (data) {
        for (var name in data) {
            if (data.hasOwnProperty(name)) {
                this.setValue(name, data[name]);
            }
        }
    },

    checkValid: function () {
        this.valid = this._fieldViewsArray.every(function (field) {
            return field.valid;
        });
        return this.valid;
    },

    beforeSubmit: function () {
        this._fieldViewsArray.forEach(function (field) {
            if (field.beforeSubmit) field.beforeSubmit();
        });
    },

    update: function (field) {
        this.trigger('change:' + field.name, field);
        // if this one's good check 'em all
        if (field.valid) {
            this.checkValid();
        } else {
            this.valid = false;
        }
    },

    remove: function () {
        this.el.removeEventListener('submit', this.handleSubmit, false);
        this._fieldViewsArray.forEach(function (field) {
            field.remove();
        });
        return View.prototype.remove.call(this);
    },

    handleSubmit: function (e) {
        this.beforeSubmit();
        this.checkValid();
        if (!this.valid) {
            e.preventDefault();
            return false;
        }

        if (this.preventDefault) {
            e.preventDefault();
            this.trigger('submit', this.data);
            return false;
        }
    },

    reset: function () {
        this._fieldViewsArray.forEach(function (field) {
            if (isFunction(field.reset)) {
                field.reset();
            }
        });
    },

    clear: function () {
        this._fieldViewsArray.forEach(function (field) {
            if (isFunction(field.clear)) {
                field.clear();
            }
        });
    },

    render: function () {
        if (this.rendered) return;
        if (!this.el) {
            this.el = document.createElement('form');
        }
        if (this.autoAppend) {
            this.fieldContainerEl = this.el.querySelector('[data-hook~=field-container]') || this.el;
        }
        this._fieldViewsArray.forEach(function renderEachField(fV) {
            this.renderField(fV, true);
        }, this);
        if (this._startingValues) {
            // setValues is ideally executed at initialize, with no persistent
            // memory consumption inside ampersand-form-view, however, some
            // fieldViews don't permit `setValue(...)` unless the field view
            // itself is rendered.  thus, cache init values into _startingValues
            // and update all values after each field is rendered
            this.setValues(this._startingValues);
            delete this._startingValues;
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.el.addEventListener('submit', this.handleSubmit, false);
        // force `change:valid` to be triggered when `valid === false` post-render,
        // despite `valid` not having changed from its default pre-render value of `false`
        this.set('valid', null, {silent: true});
        this.checkValid();
    },

    renderField: function (fieldView, renderInProgress) {
        if (!this.rendered && !renderInProgress) return this;
        fieldView.parent = this;
        fieldView.render();
        if (this.autoAppend) this.fieldContainerEl.appendChild(fieldView.el);
    },

    getValue: function(name) {
        var field = this.getField(name, true);
        return field.value;
    },

    setValue: function(name, value) {
        var field = this.getField(name, true);
        field.setValue(value);
        return this;
    },

    // deprecated
    getData: function() {
        console.warn('deprecation warning: ampersand-form-view `.getData()` replaced by `.data`');
        return this.data;
    }

});

},{"ampersand-view":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/ampersand-view.js","lodash.isfunction":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.isfunction/index.js","lodash.result":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/index.js","lodash.set":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.set/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/ampersand-view.js":[function(require,module,exports){
;if (typeof window !== "undefined") {  window.ampersand = window.ampersand || {};  window.ampersand["ampersand-view"] = window.ampersand["ampersand-view"] || [];  window.ampersand["ampersand-view"].push("9.0.2");}
var State = require('ampersand-state');
var CollectionView = require('ampersand-collection-view');
var domify = require('domify');
var uniqueId = require("lodash.uniqueid");
var pick = require("lodash.pick");
var assign = require("lodash.assign");
var forEach = require("lodash.foreach");
var result = require("lodash.result");
var last = require("lodash.last");
var isString = require("lodash.isstring");
var bind = require("lodash.bind");
var flatten = require("lodash.flatten");
var invoke = require("lodash.invoke");
var events = require('events-mixin');
var matches = require('matches-selector');
var bindings = require('ampersand-dom-bindings');
var getPath = require('lodash.get');

function View(attrs) {
    this.cid = uniqueId('view');
    attrs || (attrs = {});
    var parent = attrs.parent;
    delete attrs.parent;
    BaseState.call(this, attrs, {init: false, parent: parent});
    this.on('change:el', this._handleElementChange, this);
    this._upsertBindings();
    this.template = attrs.template || this.template;
    this._cache.rendered = false; // prep `rendered` derived cache immediately
    this.initialize.apply(this, arguments);
    if (this.autoRender && this.template) {
        this.render();
    }
}

var BaseState = State.extend({
    dataTypes: {
        element: {
            set: function (newVal) {
                return {
                    val: newVal,
                    type: newVal instanceof Element ? 'element' : typeof newVal
                };
            },
            compare: function (el1, el2) {
                return el1 === el2;
            }
        },
        collection: {
            set: function (newVal) {
                return {
                    val: newVal,
                    type: newVal && newVal.isCollection ? 'collection' : typeof newVal
                };
            },
            compare: function (currentVal, newVal) {
                return currentVal === newVal;
            }
        }
    },
    props: {
        model: 'state',
        el: 'element',
        collection: 'collection',
    },
    session: {
        _rendered: ['boolean', true, false]
    },
    derived: {
        hasData: {
            deps: ['model'],
            fn: function () {
                return !!this.model;
            }
        },
        rendered: {
            deps: ['_rendered'],
            fn: function() {
                if (this._rendered) {
                    this.trigger('render', this);
                    return true;
                }
                this.trigger('remove', this);
                return false;
            }
        }
    }
});

// Cached regex to split keys for `delegate`.
var delegateEventSplitter = /^(\S+)\s*(.*)$/;

View.prototype = Object.create(BaseState.prototype);

var queryNoElMsg = 'Query cannot be performed as this.el is not defined. Ensure that the view has been rendered.';

// Set up all inheritable properties and methods.
assign(View.prototype, {
    // ## query
    // Get an single element based on CSS selector scoped to this.el
    // if you pass an empty string it return `this.el`.
    // If you pass an element we just return it back.
    // This lets us use `get` to handle cases where users
    // can pass a selector or an already selected element.
    query: function (selector) {
        if (!this.el) {
            throw new Error(queryNoElMsg);
        }
        if (!selector) return this.el;
        if (typeof selector === 'string') {
            if (matches(this.el, selector)) return this.el;
            return this.el.querySelector(selector) || undefined;
        }
        return selector;
    },

    // ## queryAll
    // Returns an array of elements based on CSS selector scoped to this.el
    // if you pass an empty string it return `this.el`. Also includes root
    // element.
    queryAll: function (selector) {
        if (!this.el) {
            throw new Error(queryNoElMsg);
        }
        if (!selector) return [this.el];
        var res = [];
        if (matches(this.el, selector)) res.push(this.el);
        return res.concat(Array.prototype.slice.call(this.el.querySelectorAll(selector)));
    },

    // ## queryByHook
    // Convenience method for fetching element by it's `data-hook` attribute.
    // Also tries to match against root element.
    // Also supports matching 'one' of several space separated hooks.
    queryByHook: function (hook) {
        return this.query('[data-hook~="' + hook + '"]');
    },

    // ## queryAllByHook
    // Convenience method for fetching all elements by their's `data-hook` attribute.
    queryAllByHook: function (hook) {
        return this.queryAll('[data-hook~="' + hook + '"]');
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function () {},

    // **render** is the core function that your view can override. Its job is
    // to populate its element (`this.el`), with the appropriate HTML.
    _render: function () {
        this._upsertBindings();
        this.renderWithTemplate(this);
        this._rendered = true;
        return this;
    },

    // Removes this view by taking the element out of the DOM, and removing any
    // applicable events listeners.
    _remove: function () {
        if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
        this._rendered = false;
        this._downsertBindings();
        return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    _handleElementChange: function (element, delegate) {
        if (this.eventManager) this.eventManager.unbind();
        this.eventManager = events(this.el, this);
        this.delegateEvents();
        this._applyBindingsForKey();
        return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function (e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function (events) {
        if (!(events || (events = result(this, 'events')))) return this;
        this.undelegateEvents();
        for (var key in events) {
            this.eventManager.bind(key, events[key]);
        }
        return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function () {
        this.eventManager.unbind();
        return this;
    },

    // ## registerSubview
    // Pass it a view. This can be anything with a `remove` method
    registerSubview: function (view) {
        // Storage for our subviews.
        this._subviews || (this._subviews = []);
        this._subviews.push(view);
        // set the parent reference if it has not been set
        if (!view.parent) view.parent = this;
        return view;
    },

    // ## renderSubview
    // Pass it a view instance and a container element
    // to render it in. It's `remove` method will be called
    // when the parent view is destroyed.
    renderSubview: function (view, container) {
        if (typeof container === 'string') {
            container = this.query(container);
        }
        if (!container) container = this.el;
        this.registerSubview(view);
        container.appendChild(view.render().el);
        return view;
    },

    _applyBindingsForKey: function (name) {
        if (!this.el) return;
        var fns = this._parsedBindings.getGrouped(name);
        var item;
        for (item in fns) {
            fns[item].forEach(function (fn) {
                fn(this.el, getPath(this, item), last(item.split('.')));
            }, this);
        }
    },

    _initializeBindings: function () {
        if (!this.bindings) return;
        this.on('all', function (eventName) {
            if (eventName.slice(0, 7) === 'change:') {
                this._applyBindingsForKey(eventName.split(':')[1]);
            }
        }, this);
    },

    // ## _initializeSubviews
    // this is called at setup and grabs declared subviews
    _initializeSubviews: function () {
        if (!this.subviews) return;
        for (var item in this.subviews) {
            this._parseSubview(this.subviews[item], item);
        }
    },

    // ## _parseSubview
    // helper for parsing out the subview declaration and registering
    // the `waitFor` if need be.
    _parseSubview: function (subview, name) {
        //backwards compatibility with older versions, when `container` was a valid property (#114)
        if (subview.container) {
            subview.selector = subview.container;
        }
        var opts = this._parseSubviewOpts(subview);

        function action() {
            var el, subview;
            // if not rendered or we can't find our element, stop here.
            if (!this.el || !(el = this.query(opts.selector))) return;
            if (!opts.waitFor || getPath(this, opts.waitFor)) {
                subview = this[name] = opts.prepareView.call(this, el);
                if (!subview.el) {
                    this.renderSubview(subview, el);
                } else {
                    subview.render();
                    this.registerSubview(subview);
                }
                this.off('change', action);
            }
        }
        // we listen for main `change` items
        this.on('change', action, this);
    },

    // Parses the declarative subview definition.
    // You may overload this method to create your own declarative subview style.
    // You must return an object with members 'selector', 'waitFor' and 'prepareView'.
    // waitFor is trigged on the view 'change' event and so one way to extend the deferred view
    // construction is to add an additional property (props) to the view. Then setting this property
    // will satisfy the waitFor condition. You can then extend the prepareView function to pass in
    // additional data from the parent view. This can allow you to have multi-stage rendering of
    // custom data formats and to declaratively define.
    _parseSubviewOpts: function (subview) {
        var self = this;
        var opts = {
            selector: subview.selector || '[data-hook="' + subview.hook + '"]',
            waitFor: subview.waitFor || '',
            prepareView: subview.prepareView || function () {
                return new subview.constructor({
                    parent: self
                });
            }
        };
        return opts;
    },

    // Shortcut for doing everything we need to do to
    // render and fully replace current root element.
    // Either define a `template` property of your view
    // or pass in a template directly.
    // The template can either be a string or a function.
    // If it's a function it will be passed the `context`
    // argument.
    renderWithTemplate: function (context, templateArg) {
        var template = templateArg || this.template;
        if (!template) throw new Error('Template string or function needed.');
        var newDom = isString(template) ? template : template.call(this, context || this);
        if (isString(newDom)) newDom = domify(newDom);
        var parent = this.el && this.el.parentNode;
        if (parent) parent.replaceChild(newDom, this.el);
        if (newDom.nodeName === '#document-fragment') throw new Error('Views can only have one root element, including comment nodes.');
        this.el = newDom;
        return this;
    },

    // ## cacheElements
    // This is a shortcut for adding reference to specific elements within your view for
    // access later. This avoids excessive DOM queries and makes it easier to update
    // your view if your template changes.
    //
    // In your `render` method. Use it like so:
    //
    //     render: function () {
    //       this.basicRender();
    //       this.cacheElements({
    //         pages: '#pages',
    //         chat: '#teamChat',
    //         nav: 'nav#views ul',
    //         me: '#me',
    //         cheatSheet: '#cheatSheet',
    //         omniBox: '#awesomeSauce'
    //       });
    //     }
    //
    // Then later you can access elements by reference like so: `this.pages`, or `this.chat`.
    cacheElements: function (hash) {
        for (var item in hash) {
            this[item] = this.query(hash[item]);
        }
        return this;
    },

    // ## listenToAndRun
    // Shortcut for registering a listener for a model
    // and also triggering it right away.
    listenToAndRun: function (object, events, handler) {
        var bound = bind(handler, this);
        this.listenTo(object, events, bound);
        bound();
    },

    // ## animateRemove
    // Placeholder for if you want to do something special when they're removed.
    // For example fade it out, etc.
    // Any override here should call `.remove()` when done.
    animateRemove: function () {
        this.remove();
    },

    // ## renderCollection
    // Method for rendering a collections with individual views.
    // Just pass it the collection, and the view to use for the items in the
    // collection. The collectionView is returned.
    renderCollection: function (collection, ViewClass, container, opts) {
        var containerEl = (typeof container === 'string') ? this.query(container) : container;
        var config = assign({
            collection: collection,
            el: containerEl || this.el,
            view: ViewClass,
            parent: this,
            viewOptions: {
                parent: this
            }
        }, opts);
        var collectionView = new CollectionView(config);
        collectionView.render();
        return this.registerSubview(collectionView);
    },

    _setRender: function(obj) {
        Object.defineProperty(obj, 'render', {
            get: function() {
                return this._render;
            },
            set: function(fn) {
                this._render = function() {
                    fn.apply(this, arguments);
                    this._rendered = true;
                    return this;
                };
            }
        });
    },

    _setRemove: function(obj) {
        Object.defineProperty(obj, 'remove', {
            get: function() {
                return this._remove;
            },
            set: function(fn) {
                this._remove = function() {
                    fn.apply(this, arguments);
                    this._rendered = false;
                    return this;
                };
            }
        });
    },

    _downsertBindings: function() {
        var parsedBindings = this._parsedBindings;
        if (!this.bindingsSet) return;
        if (this._subviews) invoke(flatten(this._subviews), 'remove');
        this.stopListening();
        // TODO: Not sure if this is actually necessary.
        // Just trying to de-reference this potentially large
        // amount of generated functions to avoid memory leaks.
        forEach(parsedBindings, function (properties, modelName) {
            forEach(properties, function (value, key) {
                delete parsedBindings[modelName][key];
            });
            delete parsedBindings[modelName];
        });
        this.bindingsSet = false;
    },

    _upsertBindings: function(attrs) {
        attrs = attrs || this;
        if (this.bindingsSet) return;
        this._parsedBindings = bindings(this.bindings, this);
        this._initializeBindings();
        if (attrs.el && !this.autoRender) {
            this._handleElementChange();
        }
        this._initializeSubviews();
        this.bindingsSet = true;
    }
});

View.prototype._setRender(View.prototype);
View.prototype._setRemove(View.prototype);
View.extend = BaseState.extend;
module.exports = View;

},{"ampersand-collection-view":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/ampersand-collection-view.js","ampersand-dom-bindings":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/ampersand-dom-bindings.js","ampersand-state":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/ampersand-state.js","domify":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/domify/index.js","events-mixin":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/events-mixin/index.js","lodash.assign":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/index.js","lodash.bind":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.bind/index.js","lodash.flatten":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.flatten/index.js","lodash.foreach":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/index.js","lodash.get":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.get/index.js","lodash.invoke":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/index.js","lodash.isstring":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.isstring/index.js","lodash.last":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.last/index.js","lodash.pick":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.pick/index.js","lodash.result":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/index.js","lodash.uniqueid":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.uniqueid/index.js","matches-selector":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/matches-selector/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/ampersand-collection-view.js":[function(require,module,exports){
;if (typeof window !== "undefined") {  window.ampersand = window.ampersand || {};  window.ampersand["ampersand-collection-view"] = window.ampersand["ampersand-collection-view"] || [];  window.ampersand["ampersand-collection-view"].push("1.4.0");}
var assign = require('lodash.assign');
var invoke = require('lodash.invoke');
var pick = require('lodash.pick');
var find = require('lodash.find');
var difference = require('lodash.difference');
var Events = require('ampersand-events');
var ampExtend = require('ampersand-class-extend');

// options
var options = ['collection', 'el', 'viewOptions', 'view', 'emptyView', 'filter', 'reverse', 'parent'];


function CollectionView(spec) {
    if (!spec) {
        throw new ReferenceError('Collection view missing required parameters: collection, el');
    }
    if (!spec.collection) {
        throw new ReferenceError('Collection view requires a collection');
    }
    if (!spec.el && !this.insertSelf) {
        throw new ReferenceError('Collection view requires an el');
    }
    assign(this, pick(spec, options));
    this.views = [];
    this.listenTo(this.collection, 'add', this._addViewForModel);
    this.listenTo(this.collection, 'remove', this._removeViewForModel);
    this.listenTo(this.collection, 'sort', this._rerenderAll);
    this.listenTo(this.collection, 'refresh reset', this._reset);
}

assign(CollectionView.prototype, Events, {
    // for view contract compliance
    render: function () {
        this._renderAll();
        return this;
    },
    remove: function () {
        invoke(this.views, 'remove');
        this.stopListening();
    },
    _getViewByModel: function (model) {
        return find(this.views, function (view) {
            return model === view.model;
        });
    },
    _createViewForModel: function (model, renderOpts) {
        var defaultViewOptions = {model: model, collection: this.collection, parent: this};
        var view = new this.view(assign(defaultViewOptions, this.viewOptions));
        this.views.push(view);
        view.renderedByParentView = true;
        view.render(renderOpts);
        return view;
    },
    _getOrCreateByModel: function (model, renderOpts) {
        return this._getViewByModel(model) || this._createViewForModel(model, renderOpts);
    },
    _addViewForModel: function (model, collection, options) {
        var matches = this.filter ? this.filter(model) : true;
        if (!matches) {
            return;
        }
        if (this.renderedEmptyView) {
            this.renderedEmptyView.remove();
            delete this.renderedEmptyView;
        }
        var view = this._getOrCreateByModel(model, {containerEl: this.el});
        if (options && options.rerender) {
            this._insertView(view);
        } else {
            this._insertViewAtIndex(view);
        }
    },
    _insertViewAtIndex: function (view) {
        if (!view.insertSelf) {
            var pos = this.collection.indexOf(view.model);
            var modelToInsertBefore, viewToInsertBefore;

            if (this.reverse) {
                modelToInsertBefore = this.collection.at(pos - 1);
            } else {
                modelToInsertBefore = this.collection.at(pos + 1);
            }

            viewToInsertBefore = this._getViewByModel(modelToInsertBefore);

            // FIX IE bug (https://developer.mozilla.org/en-US/docs/Web/API/Node.insertBefore)
            // "In Internet Explorer an undefined value as referenceElement will throw errors, while in rest of the modern browsers, this works fine."
            if(viewToInsertBefore) {
                this.el.insertBefore(view.el, viewToInsertBefore && viewToInsertBefore.el);
            } else {
                this.el.appendChild(view.el);
            }
        }
    },
    _insertView: function (view) {
        if (!view.insertSelf) {
            if (this.reverse && this.el.firstChild) {
                this.el.insertBefore(view.el, this.el.firstChild);
            } else {
                this.el.appendChild(view.el);
            }
        }
    },
    _removeViewForModel: function (model) {
        var view = this._getViewByModel(model);
        if (!view) {
            return;
        }
        var index = this.views.indexOf(view);
        if (index !== -1) {
            // remove it if we found it calling animateRemove
            // to give user option of gracefully destroying.
            view = this.views.splice(index, 1)[0];
            this._removeView(view);
            if (this.views.length === 0) {
                this._renderEmptyView();
            }
        }
    },
    _removeView: function (view) {
        if (view.animateRemove) {
            view.animateRemove();
        } else {
            view.remove();
        }
    },
    _renderAll: function () {
        this.collection.each(this._addViewForModel, this);
        if (this.views.length === 0) {
            this._renderEmptyView();
        }
    },
    _rerenderAll: function (collection, options) {
        options = options || {};
        this.collection.each(function (model) {
            this._addViewForModel(model, this, assign(options, {rerender: true}));
        }, this);
    },
    _renderEmptyView: function() {
        if (this.emptyView && !this.renderedEmptyView) {
            var view = this.renderedEmptyView = new this.emptyView({parent: this});
            this.el.appendChild(view.render().el);
        }
    },
    _reset: function () {
        var newViews = this.collection.map(this._getOrCreateByModel, this);

        //Remove existing views from the ui
        var toRemove = difference(this.views, newViews);
        toRemove.forEach(this._removeView, this);

        //Rerender the full list with the new views
        this.views = newViews;
        this._rerenderAll();
        if (this.views.length === 0) {
            this._renderEmptyView();
        }
    }
});

CollectionView.extend = ampExtend;

module.exports = CollectionView;

},{"ampersand-class-extend":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-class-extend/ampersand-class-extend.js","ampersand-events":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/ampersand-events.js","lodash.assign":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/index.js","lodash.difference":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/index.js","lodash.find":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/index.js","lodash.invoke":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/index.js","lodash.pick":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.pick/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-class-extend/ampersand-class-extend.js":[function(require,module,exports){
var assign = require('lodash.assign');

/// Following code is largely pasted from Backbone.js

// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
var extend = function(protoProps) {
    var parent = this;
    var child;
    var args = [].slice.call(arguments);

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
    } else {
        child = function () {
            return parent.apply(this, arguments);
        };
    }

    // Add static properties to the constructor function from parent
    assign(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // Mix in all prototype properties to the subclass if supplied.
    if (protoProps) {
        args.unshift(child.prototype);
        assign.apply(null, args);
    }

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
};

// Expose the extend function
module.exports = extend;

},{"lodash.assign":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/ampersand-events.js":[function(require,module,exports){
;if (typeof window !== "undefined") {  window.ampersand = window.ampersand || {};  window.ampersand["ampersand-events"] = window.ampersand["ampersand-events"] || [];  window.ampersand["ampersand-events"].push("1.1.1");}
var runOnce = require('lodash.once');
var uniqueId = require('lodash.uniqueid');
var keys = require('lodash.keys');
var isEmpty = require('lodash.isempty');
var each = require('lodash.foreach');
var bind = require('lodash.bind');
var assign = require('lodash.assign');
var slice = Array.prototype.slice;
var eventSplitter = /\s+/;


var Events = {
    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
        if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
        this._events || (this._events = {});
        var events = this._events[name] || (this._events[name] = []);
        events.push({callback: callback, context: context, ctx: context || this});
        return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
        if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
        var self = this;
        var once = runOnce(function() {
            self.off(name, once);
            callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
        var retain, ev, events, names, i, l, j, k;
        if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
        if (!name && !callback && !context) {
            this._events = void 0;
            return this;
        }
        names = name ? [name] : keys(this._events);
        for (i = 0, l = names.length; i < l; i++) {
            name = names[i];
            if (events = this._events[name]) {
                this._events[name] = retain = [];
                if (callback || context) {
                    for (j = 0, k = events.length; j < k; j++) {
                        ev = events[j];
                        if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                                (context && context !== ev.context)) {
                            retain.push(ev);
                        }
                    }
                }
                if (!retain.length) delete this._events[name];
            }
        }

        return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
        if (!this._events) return this;
        var args = slice.call(arguments, 1);
        if (!eventsApi(this, 'trigger', name, args)) return this;
        var events = this._events[name];
        var allEvents = this._events.all;
        if (events) triggerEvents(events, args);
        if (allEvents) triggerEvents(allEvents, arguments);
        return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
        var listeningTo = this._listeningTo;
        if (!listeningTo) return this;
        var remove = !name && !callback;
        if (!callback && typeof name === 'object') callback = this;
        if (obj) (listeningTo = {})[obj._listenId] = obj;
        for (var id in listeningTo) {
            obj = listeningTo[id];
            obj.off(name, callback, this);
            if (remove || isEmpty(obj._events)) delete this._listeningTo[id];
        }
        return this;
    },

    // extend an object with event capabilities if passed
    // or just return a new one.
    createEmitter: function (obj) {
        return assign(obj || {}, Events);
    }
};

Events.bind = Events.on;
Events.unbind = Events.off;


// Implement fancy features of the Events API such as multiple event
// names `"change blur"` and jQuery-style event maps `{change: action}`
// in terms of the existing API.
var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
        for (var key in name) {
            obj[action].apply(obj, [key, name[key]].concat(rest));
        }
        return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
        var names = name.split(eventSplitter);
        for (var i = 0, l = names.length; i < l; i++) {
            obj[action].apply(obj, [names[i]].concat(rest));
        }
        return false;
    }

    return true;
};

// A difficult-to-believe, but optimized internal dispatch function for
// triggering events. Tries to keep the usual cases speedy.
var triggerEvents = function(events, args) {
    var ev;
    var i = -1;
    var l = events.length;
    var a1 = args[0];
    var a2 = args[1];
    var a3 = args[2];
    switch (args.length) {
        case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
        case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
        case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
        case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
        default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
};

var listenMethods = {
    listenTo: 'on',
    listenToOnce: 'once'
};

// Inversion-of-control versions of `on` and `once`. Tell *this* object to
// listen to an event in another object ... keeping track of what it's
// listening to.
each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback, run) {
        var listeningTo = this._listeningTo || (this._listeningTo = {});
        var id = obj._listenId || (obj._listenId = uniqueId('l'));
        listeningTo[id] = obj;
        if (!callback && typeof name === 'object') callback = this;
        obj[implementation](name, callback, this);
        return this;
    };
});

Events.listenToAndRun = function (obj, name, callback) {
    Events.listenTo.apply(this, arguments);
    if (!callback && typeof name === 'object') callback = this;
    callback.apply(this);
    return this;
};

module.exports = Events;

},{"lodash.assign":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/index.js","lodash.bind":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.bind/index.js","lodash.foreach":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/index.js","lodash.isempty":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.isempty/index.js","lodash.keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/index.js","lodash.once":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.once/index.js","lodash.uniqueid":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.uniqueid/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.isempty/index.js":[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray'),
    isFunction = require('lodash.isfunction'),
    isString = require('lodash.isstring'),
    keys = require('lodash.keys');

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is empty. A value is considered empty unless it is an
 * `arguments` object, array, string, or jQuery-like collection with a length
 * greater than `0` or an object with own enumerable properties.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {Array|Object|string} value The value to inspect.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * _.isEmpty(null);
 * // => true
 *
 * _.isEmpty(true);
 * // => true
 *
 * _.isEmpty(1);
 * // => true
 *
 * _.isEmpty([1, 2, 3]);
 * // => false
 *
 * _.isEmpty({ 'a': 1 });
 * // => false
 */
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  if (isArrayLike(value) && (isArray(value) || isString(value) || isArguments(value) ||
      (isObjectLike(value) && isFunction(value.splice)))) {
    return !value.length;
  }
  return !keys(value).length;
}

module.exports = isEmpty;

},{"lodash.isarguments":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.isempty/node_modules/lodash.isarguments/index.js","lodash.isarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.isempty/node_modules/lodash.isarray/index.js","lodash.isfunction":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.isfunction/index.js","lodash.isstring":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.isstring/index.js","lodash.keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.isempty/node_modules/lodash.isarguments/index.js":[function(require,module,exports){
/**
 * lodash 3.0.8 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value)) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object, else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array and weak map constructors,
  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is loosely based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isArguments;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.isempty/node_modules/lodash.isarray/index.js":[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var arrayTag = '[object Array]',
    funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsArray = getNative(Array, 'isArray');

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(function() { return arguments; }());
 * // => false
 */
var isArray = nativeIsArray || function(value) {
  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
};

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = isArray;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/index.js":[function(require,module,exports){
/**
 * lodash 3.1.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var getNative = require('lodash._getnative'),
    isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray');

/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/* Native method references for those with the same name as other `lodash` methods. */
var nativeKeys = getNative(Object, 'keys');

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * A fallback implementation of `Object.keys` which creates an array of the
 * own enumerable property names of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function shimKeys(object) {
  var props = keysIn(object),
      propsLength = props.length,
      length = propsLength && object.length;

  var allowIndexes = !!length && isLength(length) &&
    (isArray(object) || isArguments(object));

  var index = -1,
      result = [];

  while (++index < propsLength) {
    var key = props[index];
    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  var Ctor = object == null ? undefined : object.constructor;
  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
      (typeof object != 'function' && isArrayLike(object))) {
    return shimKeys(object);
  }
  return isObject(object) ? nativeKeys(object) : [];
};

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = (length && isLength(length) &&
    (isArray(object) || isArguments(object)) && length) || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = (index + '');
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keys;

},{"lodash._getnative":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/node_modules/lodash._getnative/index.js","lodash.isarguments":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/node_modules/lodash.isarguments/index.js","lodash.isarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/node_modules/lodash._getnative/index.js":[function(require,module,exports){
/**
 * lodash 3.9.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = getNative;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/node_modules/lodash.isarguments/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.isempty/node_modules/lodash.isarguments/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.isempty/node_modules/lodash.isarguments/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.isempty/node_modules/lodash.isarguments/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/node_modules/lodash.isarray/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.isempty/node_modules/lodash.isarray/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.isempty/node_modules/lodash.isarray/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.isempty/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.once/index.js":[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var before = require('lodash.before');

/**
 * Creates a function that is restricted to invoking `func` once. Repeat calls
 * to the function return the value of the first call. The `func` is invoked
 * with the `this` binding and arguments of the created function.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * var initialize = _.once(createApplication);
 * initialize();
 * initialize();
 * // `initialize` invokes `createApplication` once
 */
function once(func) {
  return before(2, func);
}

module.exports = once;

},{"lodash.before":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.once/node_modules/lodash.before/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.once/node_modules/lodash.before/index.js":[function(require,module,exports){
/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that invokes `func`, with the `this` binding and arguments
 * of the created function, while it is called less than `n` times. Subsequent
 * calls to the created function return the result of the last `func` invocation.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {number} n The number of calls at which `func` is no longer invoked.
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * jQuery('#add').on('click', _.before(5, addContactToList));
 * // => allows adding up to 4 contacts to the list
 */
function before(n, func) {
  var result;
  if (typeof func != 'function') {
    if (typeof n == 'function') {
      var temp = n;
      n = func;
      func = temp;
    } else {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
  }
  return function() {
    if (--n > 0) {
      result = func.apply(this, arguments);
    }
    if (n <= 1) {
      func = undefined;
    }
    return result;
  };
}

module.exports = before;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/index.js":[function(require,module,exports){
/**
 * lodash 3.2.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseDifference = require('lodash._basedifference'),
    baseFlatten = require('lodash._baseflatten'),
    restParam = require('lodash.restparam');

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Creates an array of unique `array` values not included in the other
 * provided arrays using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {...Array} [values] The arrays of values to exclude.
 * @returns {Array} Returns the new array of filtered values.
 * @example
 *
 * _.difference([1, 2, 3], [4, 2]);
 * // => [1, 3]
 */
var difference = restParam(function(array, values) {
  return (isObjectLike(array) && isArrayLike(array))
    ? baseDifference(array, baseFlatten(values, false, true))
    : [];
});

module.exports = difference;

},{"lodash._basedifference":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/index.js","lodash._baseflatten":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._baseflatten/index.js","lodash.restparam":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash.restparam/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/index.js":[function(require,module,exports){
/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseIndexOf = require('lodash._baseindexof'),
    cacheIndexOf = require('lodash._cacheindexof'),
    createCache = require('lodash._createcache');

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * The base implementation of `_.difference` which accepts a single array
 * of values to exclude.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Array} values The values to exclude.
 * @returns {Array} Returns the new array of filtered values.
 */
function baseDifference(array, values) {
  var length = array ? array.length : 0,
      result = [];

  if (!length) {
    return result;
  }
  var index = -1,
      indexOf = baseIndexOf,
      isCommon = true,
      cache = (isCommon && values.length >= LARGE_ARRAY_SIZE) ? createCache(values) : null,
      valuesLength = values.length;

  if (cache) {
    indexOf = cacheIndexOf;
    isCommon = false;
    values = cache;
  }
  outer:
  while (++index < length) {
    var value = array[index];

    if (isCommon && value === value) {
      var valuesIndex = valuesLength;
      while (valuesIndex--) {
        if (values[valuesIndex] === value) {
          continue outer;
        }
      }
      result.push(value);
    }
    else if (indexOf(values, value, 0) < 0) {
      result.push(value);
    }
  }
  return result;
}

module.exports = baseDifference;

},{"lodash._baseindexof":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._baseindexof/index.js","lodash._cacheindexof":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._cacheindexof/index.js","lodash._createcache":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._createcache/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._baseindexof/index.js":[function(require,module,exports){
/**
 * lodash 3.1.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * The base implementation of `_.indexOf` without support for binary searches.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return indexOfNaN(array, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * Gets the index at which the first occurrence of `NaN` is found in `array`.
 * If `fromRight` is provided elements of `array` are iterated from right to left.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched `NaN`, else `-1`.
 */
function indexOfNaN(array, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 0 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    var other = array[index];
    if (other !== other) {
      return index;
    }
  }
  return -1;
}

module.exports = baseIndexOf;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._cacheindexof/index.js":[function(require,module,exports){
/**
 * lodash 3.0.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Checks if `value` is in `cache` mimicking the return signature of
 * `_.indexOf` by returning `0` if the value is found, else `-1`.
 *
 * @private
 * @param {Object} cache The cache to search.
 * @param {*} value The value to search for.
 * @returns {number} Returns `0` if `value` is found, else `-1`.
 */
function cacheIndexOf(cache, value) {
  var data = cache.data,
      result = (typeof value == 'string' || isObject(value)) ? data.set.has(value) : data.hash[value];

  return result ? 0 : -1;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = cacheIndexOf;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._createcache/index.js":[function(require,module,exports){
(function (global){
/**
 * lodash 3.1.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var getNative = require('lodash._getnative');

/** Native method references. */
var Set = getNative(global, 'Set');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeCreate = getNative(Object, 'create');

/**
 *
 * Creates a cache object to store unique values.
 *
 * @private
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var length = values ? values.length : 0;

  this.data = { 'hash': nativeCreate(null), 'set': new Set };
  while (length--) {
    this.push(values[length]);
  }
}

/**
 * Adds `value` to the cache.
 *
 * @private
 * @name push
 * @memberOf SetCache
 * @param {*} value The value to cache.
 */
function cachePush(value) {
  var data = this.data;
  if (typeof value == 'string' || isObject(value)) {
    data.set.add(value);
  } else {
    data.hash[value] = true;
  }
}

/**
 * Creates a `Set` cache object to optimize linear searches of large arrays.
 *
 * @private
 * @param {Array} [values] The values to cache.
 * @returns {null|Object} Returns the new cache object if `Set` is supported, else `null`.
 */
function createCache(values) {
  return (nativeCreate && Set) ? new SetCache(values) : null;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

// Add functions to the `Set` cache.
SetCache.prototype.push = cachePush;

module.exports = createCache;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash._getnative":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._createcache/node_modules/lodash._getnative/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._createcache/node_modules/lodash._getnative/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/node_modules/lodash._getnative/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/node_modules/lodash._getnative/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/node_modules/lodash._getnative/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._baseflatten/index.js":[function(require,module,exports){
/**
 * lodash 3.1.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray');

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * The base implementation of `_.flatten` with added support for restricting
 * flattening and specifying the start index.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {boolean} [isDeep] Specify a deep flatten.
 * @param {boolean} [isStrict] Restrict flattening to arrays-like objects.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, isDeep, isStrict, result) {
  result || (result = []);

  var index = -1,
      length = array.length;

  while (++index < length) {
    var value = array[index];
    if (isObjectLike(value) && isArrayLike(value) &&
        (isStrict || isArray(value) || isArguments(value))) {
      if (isDeep) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, isDeep, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = baseFlatten;

},{"lodash.isarguments":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._baseflatten/node_modules/lodash.isarguments/index.js","lodash.isarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._baseflatten/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._baseflatten/node_modules/lodash.isarguments/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/node_modules/lodash.isarguments/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/node_modules/lodash.isarguments/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/node_modules/lodash.isarguments/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._baseflatten/node_modules/lodash.isarray/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/node_modules/lodash.isarray/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/node_modules/lodash.isarray/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash.restparam/index.js":[function(require,module,exports){
/**
 * lodash 3.6.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a function that invokes `func` with the `this` binding of the
 * created function and arguments from `start` and beyond provided as an array.
 *
 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters).
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var say = _.restParam(function(what, names) {
 *   return what + ' ' + _.initial(names).join(', ') +
 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
 * });
 *
 * say('hello', 'fred', 'barney', 'pebbles');
 * // => 'hello fred, barney, & pebbles'
 */
function restParam(func, start) {
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        rest = Array(length);

    while (++index < length) {
      rest[index] = args[start + index];
    }
    switch (start) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, args[0], rest);
      case 2: return func.call(this, args[0], args[1], rest);
    }
    var otherArgs = Array(start + 1);
    index = -1;
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = rest;
    return func.apply(this, otherArgs);
  };
}

module.exports = restParam;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/index.js":[function(require,module,exports){
/**
 * lodash 3.2.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseCallback = require('lodash._basecallback'),
    baseEach = require('lodash._baseeach'),
    baseFind = require('lodash._basefind'),
    baseFindIndex = require('lodash._basefindindex'),
    isArray = require('lodash.isarray');

/**
 * Creates a `_.find` or `_.findLast` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new find function.
 */
function createFind(eachFunc, fromRight) {
  return function(collection, predicate, thisArg) {
    predicate = baseCallback(predicate, thisArg, 3);
    if (isArray(collection)) {
      var index = baseFindIndex(collection, predicate, fromRight);
      return index > -1 ? collection[index] : undefined;
    }
    return baseFind(collection, predicate, eachFunc);
  };
}

/**
 * Iterates over elements of `collection`, returning the first element
 * `predicate` returns truthy for. The predicate is bound to `thisArg` and
 * invoked with three arguments: (value, index|key, collection).
 *
 * If a property name is provided for `predicate` the created `_.property`
 * style callback returns the property value of the given element.
 *
 * If a value is also provided for `thisArg` the created `_.matchesProperty`
 * style callback returns `true` for elements that have a matching property
 * value, else `false`.
 *
 * If an object is provided for `predicate` the created `_.matches` style
 * callback returns `true` for elements that have the properties of the given
 * object, else `false`.
 *
 * @static
 * @memberOf _
 * @alias detect
 * @category Collection
 * @param {Array|Object|string} collection The collection to search.
 * @param {Function|Object|string} [predicate=_.identity] The function invoked
 *  per iteration.
 * @param {*} [thisArg] The `this` binding of `predicate`.
 * @returns {*} Returns the matched element, else `undefined`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'age': 36, 'active': true },
 *   { 'user': 'fred',    'age': 40, 'active': false },
 *   { 'user': 'pebbles', 'age': 1,  'active': true }
 * ];
 *
 * _.result(_.find(users, function(chr) {
 *   return chr.age < 40;
 * }), 'user');
 * // => 'barney'
 *
 * // using the `_.matches` callback shorthand
 * _.result(_.find(users, { 'age': 1, 'active': true }), 'user');
 * // => 'pebbles'
 *
 * // using the `_.matchesProperty` callback shorthand
 * _.result(_.find(users, 'active', false), 'user');
 * // => 'fred'
 *
 * // using the `_.property` callback shorthand
 * _.result(_.find(users, 'active'), 'user');
 * // => 'barney'
 */
var find = createFind(baseEach);

module.exports = find;

},{"lodash._basecallback":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/index.js","lodash._baseeach":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._baseeach/index.js","lodash._basefind":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basefind/index.js","lodash._basefindindex":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basefindindex/index.js","lodash.isarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/index.js":[function(require,module,exports){
/**
 * lodash 3.3.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseIsEqual = require('lodash._baseisequal'),
    bindCallback = require('lodash._bindcallback'),
    isArray = require('lodash.isarray'),
    pairs = require('lodash.pairs');

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/,
    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `value` to a string if it's not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  return value == null ? '' : (value + '');
}

/**
 * The base implementation of `_.callback` which supports specifying the
 * number of arguments to provide to `func`.
 *
 * @private
 * @param {*} [func=_.identity] The value to convert to a callback.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {number} [argCount] The number of arguments to provide to `func`.
 * @returns {Function} Returns the callback.
 */
function baseCallback(func, thisArg, argCount) {
  var type = typeof func;
  if (type == 'function') {
    return thisArg === undefined
      ? func
      : bindCallback(func, thisArg, argCount);
  }
  if (func == null) {
    return identity;
  }
  if (type == 'object') {
    return baseMatches(func);
  }
  return thisArg === undefined
    ? property(func)
    : baseMatchesProperty(func, thisArg);
}

/**
 * The base implementation of `get` without support for string paths
 * and default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} path The path of the property to get.
 * @param {string} [pathKey] The key representation of path.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path, pathKey) {
  if (object == null) {
    return;
  }
  if (pathKey !== undefined && pathKey in toObject(object)) {
    path = [pathKey];
  }
  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[path[index++]];
  }
  return (index && index == length) ? object : undefined;
}

/**
 * The base implementation of `_.isMatch` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Array} matchData The propery names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparing objects.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = toObject(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var result = customizer ? customizer(objValue, srcValue, key) : undefined;
      if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, true) : result)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * The base implementation of `_.matches` which does not clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    var key = matchData[0][0],
        value = matchData[0][1];

    return function(object) {
      if (object == null) {
        return false;
      }
      return object[key] === value && (value !== undefined || (key in toObject(object)));
    };
  }
  return function(object) {
    return baseIsMatch(object, matchData);
  };
}

/**
 * The base implementation of `_.matchesProperty` which does not clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to compare.
 * @returns {Function} Returns the new function.
 */
function baseMatchesProperty(path, srcValue) {
  var isArr = isArray(path),
      isCommon = isKey(path) && isStrictComparable(srcValue),
      pathKey = (path + '');

  path = toPath(path);
  return function(object) {
    if (object == null) {
      return false;
    }
    var key = pathKey;
    object = toObject(object);
    if ((isArr || !isCommon) && !(key in object)) {
      object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
      if (object == null) {
        return false;
      }
      key = last(path);
      object = toObject(object);
    }
    return object[key] === srcValue
      ? (srcValue !== undefined || (key in object))
      : baseIsEqual(srcValue, object[key], undefined, true);
  };
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new function.
 */
function basePropertyDeep(path) {
  var pathKey = (path + '');
  path = toPath(path);
  return function(object) {
    return baseGet(object, path, pathKey);
  };
}

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  start = start == null ? 0 : (+start || 0);
  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = (end === undefined || end > length) ? length : (+end || 0);
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

/**
 * Gets the propery names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = pairs(object),
      length = result.length;

  while (length--) {
    result[length][2] = isStrictComparable(result[length][1]);
  }
  return result;
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  var type = typeof value;
  if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
    return true;
  }
  if (isArray(value)) {
    return false;
  }
  var result = !reIsDeepProp.test(value);
  return result || (object != null && value in toObject(object));
}

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject(value);
}

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

/**
 * Converts `value` to property path array if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Array} Returns the property path array.
 */
function toPath(value) {
  if (isArray(value)) {
    return value;
  }
  var result = [];
  baseToString(value).replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
}

/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array ? array.length : 0;
  return length ? array[length - 1] : undefined;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

/**
 * Creates a function that returns the property value at `path` on a
 * given object.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': { 'c': 2 } } },
 *   { 'a': { 'b': { 'c': 1 } } }
 * ];
 *
 * _.map(objects, _.property('a.b.c'));
 * // => [2, 1]
 *
 * _.pluck(_.sortBy(objects, _.property(['a', 'b', 'c'])), 'a.b.c');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
}

module.exports = baseCallback;

},{"lodash._baseisequal":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/node_modules/lodash._baseisequal/index.js","lodash._bindcallback":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/node_modules/lodash._bindcallback/index.js","lodash.isarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash.isarray/index.js","lodash.pairs":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/node_modules/lodash.pairs/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/node_modules/lodash._baseisequal/index.js":[function(require,module,exports){
/**
 * lodash 3.0.7 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var isArray = require('lodash.isarray'),
    isTypedArray = require('lodash.istypedarray'),
    keys = require('lodash.keys');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    stringTag = '[object String]';

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * A specialized version of `_.some` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.isEqual` without support for `this` binding
 * `customizer` functions.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparing values.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA] Tracks traversed `value` objects.
 * @param {Array} [stackB] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparing objects.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA=[]] Tracks traversed `value` objects.
 * @param {Array} [stackB=[]] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = arrayTag,
      othTag = arrayTag;

  if (!objIsArr) {
    objTag = objToString.call(object);
    if (objTag == argsTag) {
      objTag = objectTag;
    } else if (objTag != objectTag) {
      objIsArr = isTypedArray(object);
    }
  }
  if (!othIsArr) {
    othTag = objToString.call(other);
    if (othTag == argsTag) {
      othTag = objectTag;
    } else if (othTag != objectTag) {
      othIsArr = isTypedArray(other);
    }
  }
  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && !(objIsArr || objIsObj)) {
    return equalByTag(object, other, objTag);
  }
  if (!isLoose) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
    }
  }
  if (!isSameTag) {
    return false;
  }
  // Assume cyclic values are equal.
  // For more information on detecting circular references see https://es5.github.io/#JO.
  stackA || (stackA = []);
  stackB || (stackB = []);

  var length = stackA.length;
  while (length--) {
    if (stackA[length] == object) {
      return stackB[length] == other;
    }
  }
  // Add `object` and `other` to the stack of traversed objects.
  stackA.push(object);
  stackB.push(other);

  var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);

  stackA.pop();
  stackB.pop();

  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparing arrays.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA] Tracks traversed `value` objects.
 * @param {Array} [stackB] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
  var index = -1,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
    return false;
  }
  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index],
        result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;

    if (result !== undefined) {
      if (result) {
        continue;
      }
      return false;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (isLoose) {
      if (!arraySome(other, function(othValue) {
            return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
          })) {
        return false;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB))) {
      return false;
    }
  }
  return true;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} value The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag) {
  switch (tag) {
    case boolTag:
    case dateTag:
      // Coerce dates and booleans to numbers, dates to milliseconds and booleans
      // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
      return +object == +other;

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case numberTag:
      // Treat `NaN` vs. `NaN` as equal.
      return (object != +object)
        ? other != +other
        : object == +other;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings primitives and string
      // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
      return object == (other + '');
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparing values.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA] Tracks traversed `value` objects.
 * @param {Array} [stackB] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
  var objProps = keys(object),
      objLength = objProps.length,
      othProps = keys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isLoose) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  var skipCtor = isLoose;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key],
        result = customizer ? customizer(isLoose ? othValue : objValue, isLoose? objValue : othValue, key) : undefined;

    // Recursively compare objects (susceptible to call stack limits).
    if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) {
      return false;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (!skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = baseIsEqual;

},{"lodash.isarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash.isarray/index.js","lodash.istypedarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/node_modules/lodash._baseisequal/node_modules/lodash.istypedarray/index.js","lodash.keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash.keys/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/node_modules/lodash._baseisequal/node_modules/lodash.istypedarray/index.js":[function(require,module,exports){
/**
 * lodash 3.0.6 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length,
 *  else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
function isTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
}

module.exports = isTypedArray;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/node_modules/lodash._bindcallback/index.js":[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `baseCallback` which only supports `this` binding
 * and specifying the number of arguments to provide to `func`.
 *
 * @private
 * @param {Function} func The function to bind.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {number} [argCount] The number of arguments to provide to `func`.
 * @returns {Function} Returns the callback.
 */
function bindCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  if (thisArg === undefined) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
    case 5: return function(value, other, key, object, source) {
      return func.call(thisArg, value, other, key, object, source);
    };
  }
  return function() {
    return func.apply(thisArg, arguments);
  };
}

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = bindCallback;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/node_modules/lodash.pairs/index.js":[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var keys = require('lodash.keys');

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Creates a two dimensional array of the key-value pairs for `object`,
 * e.g. `[[key1, value1], [key2, value2]]`.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the new array of key-value pairs.
 * @example
 *
 * _.pairs({ 'barney': 36, 'fred': 40 });
 * // => [['barney', 36], ['fred', 40]] (iteration order is not guaranteed)
 */
function pairs(object) {
  object = toObject(object);

  var index = -1,
      props = keys(object),
      length = props.length,
      result = Array(length);

  while (++index < length) {
    var key = props[index];
    result[index] = [key, object[key]];
  }
  return result;
}

module.exports = pairs;

},{"lodash.keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash.keys/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._baseeach/index.js":[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var keys = require('lodash.keys');

/**
 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * The base implementation of `_.forEach` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object|string} Returns `collection`.
 */
var baseEach = createBaseEach(baseForOwn);

/**
 * The base implementation of `baseForIn` and `baseForOwn` which iterates
 * over `object` properties returned by `keysFunc` invoking `iteratee` for
 * each property. Iteratee functions may exit iteration early by explicitly
 * returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `_.forOwn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return baseFor(object, iteratee, keys);
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    var length = collection ? getLength(collection) : 0;
    if (!isLength(length)) {
      return eachFunc(collection, iteratee);
    }
    var index = fromRight ? length : -1,
        iterable = toObject(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

/**
 * Creates a base function for `_.forIn` or `_.forInRight`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var iterable = toObject(object),
        props = keysFunc(object),
        length = props.length,
        index = fromRight ? length : -1;

    while ((fromRight ? index-- : ++index < length)) {
      var key = props[index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = baseEach;

},{"lodash.keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash.keys/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basefind/index.js":[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * The base implementation of `_.find`, `_.findLast`, `_.findKey`, and `_.findLastKey`,
 * without support for callback shorthands and `this` binding, which iterates
 * over `collection` using the provided `eachFunc`.
 *
 * @private
 * @param {Array|Object|string} collection The collection to search.
 * @param {Function} predicate The function invoked per iteration.
 * @param {Function} eachFunc The function to iterate over `collection`.
 * @param {boolean} [retKey] Specify returning the key of the found element
 *  instead of the element itself.
 * @returns {*} Returns the found element or its key, else `undefined`.
 */
function baseFind(collection, predicate, eachFunc, retKey) {
  var result;
  eachFunc(collection, function(value, key, collection) {
    if (predicate(value, key, collection)) {
      result = retKey ? key : value;
      return false;
    }
  });
  return result;
}

module.exports = baseFind;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basefindindex/index.js":[function(require,module,exports){
/**
 * lodash 3.6.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for callback shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {Function} predicate The function invoked per iteration.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromRight) {
  var length = array.length,
      index = fromRight ? length : -1;

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

module.exports = baseFindIndex;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash.isarray/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._baseflatten/node_modules/lodash.isarray/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._baseflatten/node_modules/lodash.isarray/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._baseflatten/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash.keys/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/node_modules/lodash.keys/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/ampersand-dom-bindings.js":[function(require,module,exports){
;if (typeof window !== "undefined") {  window.ampersand = window.ampersand || {};  window.ampersand["ampersand-dom-bindings"] = window.ampersand["ampersand-dom-bindings"] || [];  window.ampersand["ampersand-dom-bindings"].push("3.8.0");}
var Store = require('key-tree-store');
var dom = require('ampersand-dom');
var matchesSelector = require('matches-selector');
var partial = require('lodash.partial');
var slice = Array.prototype.slice;

function getMatches(el, selector) {
    if (selector === '') return [el];
    var matches = [];
    if (matchesSelector(el, selector)) matches.push(el);
    return matches.concat(slice.call(el.querySelectorAll(selector)));
}

function setAttributes(el, attrs) {
    for (var name in attrs) {
        dom.setAttribute(el, name, attrs[name]);
    }
}

function removeAttributes(el, attrs) {
    for (var name in attrs) {
        dom.removeAttribute(el, name);
    }
}

function makeArray(val) {
    return Array.isArray(val) ? val : [val];
}

function switchHandler(binding, el, value) {
    // the element selector to show
    var showValue = binding.cases[value];
    // hide all the other elements with a different value
    for (var item in binding.cases) {
        var curValue = binding.cases[item];
        if (value !== item && curValue !== showValue) {
            getMatches(el, curValue).forEach(function (match) {
                dom.hide(match);
            });
        }
    }
    getMatches(el, showValue).forEach(function (match) {
        dom.show(match);
    });
}

function getSelector(binding) {
    if (typeof binding.selector === 'string') {
        return binding.selector;
    } else if (binding.hook) {
        return '[data-hook~="' + binding.hook + '"]';
    } else {
        return '';
    }
}

function getBindingFunc(binding, context) {
    var type = binding.type || 'text';
    var isCustomBinding = typeof type === 'function';
    var selector = getSelector(binding);
    var yes = binding.yes;
    var no = binding.no;
    var hasYesNo = !!(yes || no);

    // storage variable for previous if relevant
    var previousValue;

    if (isCustomBinding) {
        return function (el, value) {
            getMatches(el, selector).forEach(function (match) {
                type.call(context, match, value, previousValue);
            });
            previousValue = value;
        };
    } else if (type === 'text') {
        return function (el, value) {
            getMatches(el, selector).forEach(function (match) {
                dom.text(match, value);
            });
        };
    } else if (type === 'class') {
        return function (el, value) {
            getMatches(el, selector).forEach(function (match) {
                dom.switchClass(match, previousValue, value);
            });
            previousValue = value;
        };
    } else if (type === 'attribute') {
        if (!binding.name) throw Error('attribute bindings must have a "name"');
        return function (el, value) {
            var names = makeArray(binding.name);
            getMatches(el, selector).forEach(function (match) {
                names.forEach(function (name) {
                    dom.setAttribute(match, name, value);
                });
            });
            previousValue = value;
        };
    } else if (type === 'value') {
        return function (el, value) {
            getMatches(el, selector).forEach(function (match) {
                if (!value && value !== 0) value = '';
                // only apply bindings if element is not currently focused
                if (document.activeElement !== match) match.value = value;
            });
            previousValue = value;
        };
    } else if (type === 'booleanClass') {
        // if there's a `no` case this is actually a switch
        if (hasYesNo) {
            yes = makeArray(yes || '');
            no = makeArray(no || '');
            return function (el, value) {
                var prevClass = value ? no : yes;
                var newClass = value ? yes : no;
                getMatches(el, selector).forEach(function (match) {
                    prevClass.forEach(function (pc) {
                        dom.removeClass(match, pc);
                    });
                    newClass.forEach(function (nc) {
                        dom.addClass(match, nc);
                    });
                });
            };
        } else {
            return function (el, value, keyName) {
                var name = makeArray(binding.name || keyName);
                var invert = (binding.invert || false);
                value = (invert ? (value ? false : true) : value);
                getMatches(el, selector).forEach(function (match) {
                    name.forEach(function (className) {
                        dom[value ? 'addClass' : 'removeClass'](match, className);
                    });
                });
            };
        }
    } else if (type === 'booleanAttribute') {
        // if there are `yes` and `no` selectors, this swaps between them
        if (hasYesNo) {
            yes = makeArray(yes || '');
            no = makeArray(no || '');
            return function (el, value) {
                var prevAttribute = value ? no : yes;
                var newAttribute = value ? yes : no;
                getMatches(el, selector).forEach(function (match) {
                    prevAttribute.forEach(function (pa) {
                        if (pa) {
                            dom.removeAttribute(match, pa);
                        }
                    });
                    newAttribute.forEach(function (na) {
                        if (na) {
                            dom.addAttribute(match, na);
                        }
                    });
                });
            };
        } else {
            return function (el, value, keyName) {
                var name = makeArray(binding.name || keyName);
                var invert = (binding.invert || false);
                value = (invert ? (value ? false : true) : value);
                getMatches(el, selector).forEach(function (match) {
                    name.forEach(function (attr) {
                        dom[value ? 'addAttribute' : 'removeAttribute'](match, attr);
                    });
                });
            };
        }
    } else if (type === 'toggle') {
        var mode = (binding.mode || 'display');
        var invert = (binding.invert || false);
        // this doesn't require a selector since we can pass yes/no selectors
        if (hasYesNo) {
            return function (el, value) {
                getMatches(el, yes).forEach(function (match) {
                    dom[value ? 'show' : 'hide'](match, mode);
                });
                getMatches(el, no).forEach(function (match) {
                    dom[value ? 'hide' : 'show'](match, mode);
                });
            };
        } else {
            return function (el, value) {
                value = (invert ? (value ? false : true) : value);
                getMatches(el, selector).forEach(function (match) {
                    dom[value ? 'show' : 'hide'](match, mode);
                });
            };
        }
    } else if (type === 'switch') {
        if (!binding.cases) throw Error('switch bindings must have "cases"');
        return partial(switchHandler, binding);
    } else if (type === 'innerHTML') {
        return function (el, value) {
            getMatches(el, selector).forEach(function (match) {
                dom.html(match, value);
            });
        };
    } else if (type === 'switchClass') {
        if (!binding.cases) throw Error('switchClass bindings must have "cases"');
        return function (el, value, keyName) {
            var name = makeArray(binding.name || keyName);
            for (var item in binding.cases) {
                getMatches(el, binding.cases[item]).forEach(function (match) {
                    name.forEach(function (className) {
                        dom[value === item ? 'addClass' : 'removeClass'](match, className);
                    });
                });
            }
        };
    } else if (type === 'switchAttribute') {
        if (!binding.cases) throw Error('switchAttribute bindings must have "cases"');
        return function (el, value, keyName) {
            getMatches(el, selector).forEach(function (match) {
                if (previousValue) {
                    removeAttributes(match, previousValue);
                }

                if (value in binding.cases) {
                    var attrs = binding.cases[value];
                    if (typeof attrs === 'string') {
                        attrs = {};
                        attrs[binding.name || keyName] = binding.cases[value];
                    }
                    setAttributes(match, attrs);

                    previousValue = attrs;
                }
            });
        };
    } else {
        throw new Error('no such binding type: ' + type);
    }
}

// returns a key-tree-store of functions
// that can be applied to any element/model.

// all resulting functions should be called
// like func(el, value, lastKeyName)
module.exports = function (bindings, context) {
    var store = new Store();
    var key, current;

    for (key in bindings) {
        current = bindings[key];
        if (typeof current === 'string') {
            store.add(key, getBindingFunc({
                type: 'text',
                selector: current
            }));
        } else if (current.forEach) {
            current.forEach(function (binding) {
                store.add(key, getBindingFunc(binding, context));
            });
        } else {
            store.add(key, getBindingFunc(current, context));
        }
    }

    return store;
};

},{"ampersand-dom":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/ampersand-dom/ampersand-dom.js","key-tree-store":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/key-tree-store/key-tree-store.js","lodash.partial":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/index.js","matches-selector":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/matches-selector/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/ampersand-dom/ampersand-dom.js":[function(require,module,exports){
;if (typeof window !== "undefined") {  window.ampersand = window.ampersand || {};  window.ampersand["ampersand-dom"] = window.ampersand["ampersand-dom"] || [];  window.ampersand["ampersand-dom"].push("1.5.0");}
var dom = module.exports = {
    text: function (el, val) {
        el.textContent = getString(val);
    },
    // optimize if we have classList
    addClass: function (el, cls) {
        cls = getString(cls);
        if (!cls) return;
        if (Array.isArray(cls)) {
            cls.forEach(function(c) {
                dom.addClass(el, c);
            });
        } else if (el.classList) {
            el.classList.add(cls);
        } else {
            if (!hasClass(el, cls)) {
                if (el.classList) {
                    el.classList.add(cls);
                } else {
                    el.className += ' ' + cls;
                }
            }
        }
    },
    removeClass: function (el, cls) {
        if (Array.isArray(cls)) {
            cls.forEach(function(c) {
                dom.removeClass(el, c);
            });
        } else if (el.classList) {
            cls = getString(cls);
            if (cls) el.classList.remove(cls);
        } else {
            // may be faster to not edit unless we know we have it?
            el.className = el.className.replace(new RegExp('(^|\\b)' + cls.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    },
    hasClass: hasClass,
    switchClass: function (el, prevCls, newCls) {
        if (prevCls) this.removeClass(el, prevCls);
        this.addClass(el, newCls);
    },
    // makes sure attribute (with no content) is added
    // if exists it will be cleared of content
    addAttribute: function (el, attr) {
        // setting to empty string does same
        el.setAttribute(attr, '');
        // Some browsers won't update UI for boolean attributes unless you
        // set it directly. So we do both
        if (hasBooleanProperty(el, attr)) el[attr] = true;
    },
    // completely removes attribute
    removeAttribute: function (el, attr) {
        el.removeAttribute(attr);
        if (hasBooleanProperty(el, attr)) el[attr] = false;
    },
    // sets attribute to string value given, clearing any current value
    setAttribute: function (el, attr, value) {
        el.setAttribute(attr, getString(value));
    },
    getAttribute: function (el, attr) {
        return el.getAttribute(attr);
    },
    hasAttribute: function (el, attr) {
        return el.hasAttribute(attr);
    },
    hide: function (el, mode) {
        if (!mode) mode = 'display';
        if (!isHidden(el)) {
            storeDisplayStyle(el, mode);
            hide(el, mode);
        }
    },
    // show element
    show: function (el, mode) {
        if (!mode) mode = 'display';
        show(el, mode);
    },
    toggle: function (el, mode) {
        if (!isHidden(el)) {
            dom.hide(el, mode);
        } else {
            dom.show(el, mode);
        }
    },
    html: function (el, content) {
        el.innerHTML = content;
    }
};

// helpers
function getString(val) {
    if (!val && val !== 0) {
        return '';
    } else {
        return val;
    }
}

function hasClass(el, cls) {
    if (el.classList) {
        return el.classList.contains(cls);
    } else {
        return new RegExp('(^| )' + cls + '( |$)', 'gi').test(el.className);
    }
}

function hasBooleanProperty(el, prop) {
    var val = el[prop];
    return prop in el && (val === true || val === false);
}

function isHidden (el) {
    return dom.getAttribute(el, 'data-anddom-hidden') === 'true';
}

function storeDisplayStyle (el, mode) {
    dom.setAttribute(el, 'data-anddom-' + mode, el.style[mode]);
}

function show (el, mode) {
    el.style[mode] = dom.getAttribute(el, 'data-anddom-' + mode) || '';
    dom.removeAttribute(el, 'data-anddom-hidden');
}

function hide (el, mode) {
    dom.setAttribute(el, 'data-anddom-hidden', 'true');
    el.style[mode] = (mode === 'visibility' ? 'hidden' : 'none');
}

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/key-tree-store/key-tree-store.js":[function(require,module,exports){
var slice = Array.prototype.slice;

// our constructor
function KeyTreeStore(options) {
    options = options || {};
    if (typeof options !== 'object') {
        throw new TypeError('Options must be an object');
    }
    var DEFAULT_SEPARATOR = '.';

    this.storage = {};
    this.separator = options.separator || DEFAULT_SEPARATOR;
}

// add an object to the store
KeyTreeStore.prototype.add = function (keypath, obj) {
    var arr = this.storage[keypath] || (this.storage[keypath] = []);
    arr.push(obj);
};

// remove an object
KeyTreeStore.prototype.remove = function (obj) {
    var path, arr;
    for (path in this.storage) {
        arr = this.storage[path];
        arr.some(function (item, index) {
            if (item === obj) {
                arr.splice(index, 1);
                return true;
            }
        });
    }
};

// get array of all all relevant functions, without keys
KeyTreeStore.prototype.get = function (keypath) {
    var res = [];
    var key;

    for (key in this.storage) {
        if (!keypath || keypath === key || key.indexOf(keypath + this.separator) === 0) {
            res = res.concat(this.storage[key]);
        }
    }

    return res;
};

// get all results that match keypath but still grouped by key
KeyTreeStore.prototype.getGrouped = function (keypath) {
    var res = {};
    var key;

    for (key in this.storage) {
        if (!keypath || keypath === key || key.indexOf(keypath + this.separator) === 0) {
            res[key] = slice.call(this.storage[key]);
        }
    }

    return res;
};

// get all results that match keypath but still grouped by key
KeyTreeStore.prototype.getAll = function (keypath) {
    var res = {};
    var key;

    for (key in this.storage) {
        if (keypath === key || key.indexOf(keypath + this.separator) === 0) {
            res[key] = slice.call(this.storage[key]);
        }
    }

    return res;
};

// run all matches with optional context
KeyTreeStore.prototype.run = function (keypath, context) {
    var args = slice.call(arguments, 2);
    this.get(keypath).forEach(function (fn) {
        fn.apply(context || this, args);
    });
};

module.exports = KeyTreeStore;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/index.js":[function(require,module,exports){
/**
 * lodash 3.1.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var createWrapper = require('lodash._createwrapper'),
    replaceHolders = require('lodash._replaceholders'),
    restParam = require('lodash.restparam');

/** Used to compose bitmasks for wrapper metadata. */
var PARTIAL_FLAG = 32;

/**
 * Creates a `_.partial` or `_.partialRight` function.
 *
 * @private
 * @param {boolean} flag The partial bit flag.
 * @returns {Function} Returns the new partial function.
 */
function createPartial(flag) {
  var partialFunc = restParam(function(func, partials) {
    var holders = replaceHolders(partials, partialFunc.placeholder);
    return createWrapper(func, flag, undefined, partials, holders);
  });
  return partialFunc;
}

/**
 * Creates a function that invokes `func` with `partial` arguments prepended
 * to those provided to the new function. This method is like `_.bind` except
 * it does **not** alter the `this` binding.
 *
 * The `_.partial.placeholder` value, which defaults to `_` in monolithic
 * builds, may be used as a placeholder for partially applied arguments.
 *
 * **Note:** This method does not set the "length" property of partially
 * applied functions.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to partially apply arguments to.
 * @param {...*} [partials] The arguments to be partially applied.
 * @returns {Function} Returns the new partially applied function.
 * @example
 *
 * var greet = function(greeting, name) {
 *   return greeting + ' ' + name;
 * };
 *
 * var sayHelloTo = _.partial(greet, 'hello');
 * sayHelloTo('fred');
 * // => 'hello fred'
 *
 * // using placeholders
 * var greetFred = _.partial(greet, _, 'fred');
 * greetFred('hi');
 * // => 'hi fred'
 */
var partial = createPartial(PARTIAL_FLAG);

// Assign default placeholders.
partial.placeholder = {};

module.exports = partial;

},{"lodash._createwrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash._createwrapper/index.js","lodash._replaceholders":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash._replaceholders/index.js","lodash.restparam":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash.restparam/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash._createwrapper/index.js":[function(require,module,exports){
/**
 * lodash 3.2.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var root = require('lodash._root');

/** Used to compose bitmasks for wrapper metadata. */
var BIND_FLAG = 1,
    BIND_KEY_FLAG = 2,
    CURRY_BOUND_FLAG = 4,
    CURRY_FLAG = 8,
    CURRY_RIGHT_FLAG = 16,
    PARTIAL_FLAG = 32,
    PARTIAL_RIGHT_FLAG = 64,
    ARY_FLAG = 128,
    FLIP_FLAG = 512;

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_SAFE_INTEGER = 9007199254740991,
    MAX_INTEGER = 1.7976931348623157e+308,
    NAN = 0 / 0;

/** Used as the internal argument placeholder. */
var PLACEHOLDER = '__lodash_placeholder__';

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {...*} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  var length = args.length;
  switch (length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Replaces all `placeholder` elements in `array` with an internal placeholder
 * and returns an array of their indexes.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {*} placeholder The placeholder to replace.
 * @returns {Array} Returns the new array of placeholder indexes.
 */
function replaceHolders(array, placeholder) {
  var index = -1,
      length = array.length,
      resIndex = -1,
      result = [];

  while (++index < length) {
    if (array[index] === placeholder) {
      array[index] = PLACEHOLDER;
      result[++resIndex] = index;
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(prototype) {
    if (isObject(prototype)) {
      object.prototype = prototype;
      var result = new object;
      object.prototype = undefined;
    }
    return result || {};
  };
}());

/**
 * Creates an array that is the composition of partially applied arguments,
 * placeholders, and provided arguments into a single array of arguments.
 *
 * @private
 * @param {Array|Object} args The provided arguments.
 * @param {Array} partials The arguments to prepend to those provided.
 * @param {Array} holders The `partials` placeholder indexes.
 * @returns {Array} Returns the new array of composed arguments.
 */
function composeArgs(args, partials, holders) {
  var holdersLength = holders.length,
      argsIndex = -1,
      argsLength = nativeMax(args.length - holdersLength, 0),
      leftIndex = -1,
      leftLength = partials.length,
      result = Array(leftLength + argsLength);

  while (++leftIndex < leftLength) {
    result[leftIndex] = partials[leftIndex];
  }
  while (++argsIndex < holdersLength) {
    result[holders[argsIndex]] = args[argsIndex];
  }
  while (argsLength--) {
    result[leftIndex++] = args[argsIndex++];
  }
  return result;
}

/**
 * This function is like `composeArgs` except that the arguments composition
 * is tailored for `_.partialRight`.
 *
 * @private
 * @param {Array|Object} args The provided arguments.
 * @param {Array} partials The arguments to append to those provided.
 * @param {Array} holders The `partials` placeholder indexes.
 * @returns {Array} Returns the new array of composed arguments.
 */
function composeArgsRight(args, partials, holders) {
  var holdersIndex = -1,
      holdersLength = holders.length,
      argsIndex = -1,
      argsLength = nativeMax(args.length - holdersLength, 0),
      rightIndex = -1,
      rightLength = partials.length,
      result = Array(argsLength + rightLength);

  while (++argsIndex < argsLength) {
    result[argsIndex] = args[argsIndex];
  }
  var offset = argsIndex;
  while (++rightIndex < rightLength) {
    result[offset + rightIndex] = partials[rightIndex];
  }
  while (++holdersIndex < holdersLength) {
    result[offset + holders[holdersIndex]] = args[argsIndex++];
  }
  return result;
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Creates a function that wraps `func` to invoke it with the optional `this`
 * binding of `thisArg`.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {number} bitmask The bitmask of wrapper flags. See `createWrapper` for more details.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createBaseWrapper(func, bitmask, thisArg) {
  var isBind = bitmask & BIND_FLAG,
      Ctor = createCtorWrapper(func);

  function wrapper() {
    var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
    return fn.apply(isBind ? thisArg : this, arguments);
  }
  return wrapper;
}

/**
 * Creates a function that produces an instance of `Ctor` regardless of
 * whether it was invoked as part of a `new` expression or by `call` or `apply`.
 *
 * @private
 * @param {Function} Ctor The constructor to wrap.
 * @returns {Function} Returns the new wrapped function.
 */
function createCtorWrapper(Ctor) {
  return function() {
    // Use a `switch` statement to work with class constructors.
    // See http://ecma-international.org/ecma-262/6.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
    // for more details.
    var args = arguments;
    switch (args.length) {
      case 0: return new Ctor;
      case 1: return new Ctor(args[0]);
      case 2: return new Ctor(args[0], args[1]);
      case 3: return new Ctor(args[0], args[1], args[2]);
      case 4: return new Ctor(args[0], args[1], args[2], args[3]);
      case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
      case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
      case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
    }
    var thisBinding = baseCreate(Ctor.prototype),
        result = Ctor.apply(thisBinding, args);

    // Mimic the constructor's `return` behavior.
    // See https://es5.github.io/#x13.2.2 for more details.
    return isObject(result) ? result : thisBinding;
  };
}

/**
 * Creates a function that wraps `func` to enable currying.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {number} bitmask The bitmask of wrapper flags. See `createWrapper` for more details.
 * @param {number} arity The arity of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createCurryWrapper(func, bitmask, arity) {
  var Ctor = createCtorWrapper(func);

  function wrapper() {
    var length = arguments.length,
        index = length,
        args = Array(length),
        fn = (this && this !== root && this instanceof wrapper) ? Ctor : func,
        placeholder = wrapper.placeholder;

    while (index--) {
      args[index] = arguments[index];
    }
    var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)
      ? []
      : replaceHolders(args, placeholder);

    length -= holders.length;
    return length < arity
      ? createRecurryWrapper(func, bitmask, createHybridWrapper, placeholder, undefined, args, holders, undefined, undefined, arity - length)
      : apply(fn, this, args);
  }
  return wrapper;
}

/**
 * Creates a function that wraps `func` to invoke it with optional `this`
 * binding of `thisArg`, partial application, and currying.
 *
 * @private
 * @param {Function|string} func The function or method name to wrap.
 * @param {number} bitmask The bitmask of wrapper flags. See `createWrapper` for more details.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {Array} [partials] The arguments to prepend to those provided to the new function.
 * @param {Array} [holders] The `partials` placeholder indexes.
 * @param {Array} [partialsRight] The arguments to append to those provided to the new function.
 * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
 * @param {Array} [argPos] The argument positions of the new function.
 * @param {number} [ary] The arity cap of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
  var isAry = bitmask & ARY_FLAG,
      isBind = bitmask & BIND_FLAG,
      isBindKey = bitmask & BIND_KEY_FLAG,
      isCurry = bitmask & CURRY_FLAG,
      isCurryRight = bitmask & CURRY_RIGHT_FLAG,
      isFlip = bitmask & FLIP_FLAG,
      Ctor = isBindKey ? undefined : createCtorWrapper(func);

  function wrapper() {
    var length = arguments.length,
        index = length,
        args = Array(length);

    while (index--) {
      args[index] = arguments[index];
    }
    if (partials) {
      args = composeArgs(args, partials, holders);
    }
    if (partialsRight) {
      args = composeArgsRight(args, partialsRight, holdersRight);
    }
    if (isCurry || isCurryRight) {
      var placeholder = wrapper.placeholder,
          argsHolders = replaceHolders(args, placeholder);

      length -= argsHolders.length;
      if (length < arity) {
        return createRecurryWrapper(func, bitmask, createHybridWrapper, placeholder, thisArg, args, argsHolders, argPos, ary, arity - length);
      }
    }
    var thisBinding = isBind ? thisArg : this,
        fn = isBindKey ? thisBinding[func] : func;

    if (argPos) {
      args = reorder(args, argPos);
    } else if (isFlip && args.length > 1) {
      args.reverse();
    }
    if (isAry && ary < args.length) {
      args.length = ary;
    }
    if (this && this !== root && this instanceof wrapper) {
      fn = Ctor || createCtorWrapper(fn);
    }
    return fn.apply(thisBinding, args);
  }
  return wrapper;
}

/**
 * Creates a function that wraps `func` to invoke it with the optional `this`
 * binding of `thisArg` and the `partials` prepended to those provided to
 * the wrapper.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {number} bitmask The bitmask of wrapper flags. See `createWrapper` for more details.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} partials The arguments to prepend to those provided to the new function.
 * @returns {Function} Returns the new wrapped function.
 */
function createPartialWrapper(func, bitmask, thisArg, partials) {
  var isBind = bitmask & BIND_FLAG,
      Ctor = createCtorWrapper(func);

  function wrapper() {
    var argsIndex = -1,
        argsLength = arguments.length,
        leftIndex = -1,
        leftLength = partials.length,
        args = Array(leftLength + argsLength),
        fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;

    while (++leftIndex < leftLength) {
      args[leftIndex] = partials[leftIndex];
    }
    while (argsLength--) {
      args[leftIndex++] = arguments[++argsIndex];
    }
    return apply(fn, isBind ? thisArg : this, args);
  }
  return wrapper;
}

/**
 * Creates a function that wraps `func` to continue currying.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {number} bitmask The bitmask of wrapper flags. See `createWrapper` for more details.
 * @param {Function} wrapFunc The function to create the `func` wrapper.
 * @param {*} placeholder The placeholder to replace.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {Array} [partials] The arguments to prepend to those provided to the new function.
 * @param {Array} [holders] The `partials` placeholder indexes.
 * @param {Array} [argPos] The argument positions of the new function.
 * @param {number} [ary] The arity cap of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createRecurryWrapper(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
  var isCurry = bitmask & CURRY_FLAG,
      newArgPos = argPos ? copyArray(argPos) : undefined,
      newsHolders = isCurry ? holders : undefined,
      newHoldersRight = isCurry ? undefined : holders,
      newPartials = isCurry ? partials : undefined,
      newPartialsRight = isCurry ? undefined : partials;

  bitmask |= (isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG);
  bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);

  if (!(bitmask & CURRY_BOUND_FLAG)) {
    bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);
  }
  var result = wrapFunc(func, bitmask, thisArg, newPartials, newsHolders, newPartialsRight, newHoldersRight, newArgPos, ary, arity);

  result.placeholder = placeholder;
  return result;
}

/**
 * Creates a function that either curries or invokes `func` with optional
 * `this` binding and partially applied arguments.
 *
 * @private
 * @param {Function|string} func The function or method name to wrap.
 * @param {number} bitmask The bitmask of wrapper flags.
 *  The bitmask may be composed of the following flags:
 *     1 - `_.bind`
 *     2 - `_.bindKey`
 *     4 - `_.curry` or `_.curryRight` of a bound function
 *     8 - `_.curry`
 *    16 - `_.curryRight`
 *    32 - `_.partial`
 *    64 - `_.partialRight`
 *   128 - `_.rearg`
 *   256 - `_.ary`
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {Array} [partials] The arguments to be partially applied.
 * @param {Array} [holders] The `partials` placeholder indexes.
 * @param {Array} [argPos] The argument positions of the new function.
 * @param {number} [ary] The arity cap of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
  var isBindKey = bitmask & BIND_KEY_FLAG;
  if (!isBindKey && typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var length = partials ? partials.length : 0;
  if (!length) {
    bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);
    partials = holders = undefined;
  }
  ary = ary === undefined ? ary : nativeMax(toInteger(ary), 0);
  arity = arity === undefined ? arity : toInteger(arity);
  length -= holders ? holders.length : 0;

  if (bitmask & PARTIAL_RIGHT_FLAG) {
    var partialsRight = partials,
        holdersRight = holders;

    partials = holders = undefined;
  }
  var newData = [func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity];

  func = newData[0];
  bitmask = newData[1];
  thisArg = newData[2];
  partials = newData[3];
  holders = newData[4];
  arity = newData[9] = newData[9] == null
    ? (isBindKey ? 0 : func.length)
    : nativeMax(newData[9] - length, 0);

  if (!arity && bitmask & (CURRY_FLAG | CURRY_RIGHT_FLAG)) {
    bitmask &= ~(CURRY_FLAG | CURRY_RIGHT_FLAG);
  }
  if (!bitmask || bitmask == BIND_FLAG) {
    var result = createBaseWrapper(func, bitmask, thisArg);
  } else if (bitmask == CURRY_FLAG || bitmask == CURRY_RIGHT_FLAG) {
    result = createCurryWrapper(func, bitmask, arity);
  } else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !holders.length) {
    result = createPartialWrapper(func, bitmask, thisArg, partials);
  } else {
    result = createHybridWrapper.apply(undefined, newData);
  }
  return result;
}

/**
 * Reorder `array` according to the specified indexes where the element at
 * the first index is assigned as the first element, the element at
 * the second index is assigned as the second element, and so on.
 *
 * @private
 * @param {Array} array The array to reorder.
 * @param {Array} indexes The arranged array indexes.
 * @returns {Array} Returns `array`.
 */
function reorder(array, indexes) {
  var arrLength = array.length,
      length = nativeMin(indexes.length, arrLength),
      oldArray = copyArray(array);

  while (length--) {
    var index = indexes[length];
    array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
  }
  return array;
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array constructors, and
  // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Converts `value` to an integer.
 *
 * **Note:** This function is loosely based on [`ToInteger`](http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3');
 * // => 3
 */
function toInteger(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  var remainder = value % 1;
  return value === value ? (remainder ? value - remainder : value) : 0;
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3);
 * // => 3
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3');
 * // => 3
 */
function toNumber(value) {
  if (isObject(value)) {
    var other = isFunction(value.valueOf) ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = createWrapper;

},{"lodash._root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash._createwrapper/node_modules/lodash._root/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash._createwrapper/node_modules/lodash._root/index.js":[function(require,module,exports){
(function (global){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used to determine if values are of the language type `Object`. */
var objectTypes = {
  'function': true,
  'object': true
};

/** Detect free variable `exports`. */
var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
  ? exports
  : undefined;

/** Detect free variable `module`. */
var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
  ? module
  : undefined;

/** Detect free variable `global` from Node.js. */
var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

/** Detect free variable `self`. */
var freeSelf = checkGlobal(objectTypes[typeof self] && self);

/** Detect free variable `window`. */
var freeWindow = checkGlobal(objectTypes[typeof window] && window);

/** Detect `this` as the global object. */
var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

/**
 * Used as a reference to the global object.
 *
 * The `this` value is used if it's the global object to avoid Greasemonkey's
 * restricted `window` object, otherwise the `window` object is used.
 */
var root = freeGlobal ||
  ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
    freeSelf || thisGlobal || Function('return this')();

/**
 * Checks if `value` is a global object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
 */
function checkGlobal(value) {
  return (value && value.Object === Object) ? value : null;
}

module.exports = root;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash._replaceholders/index.js":[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used as the internal argument placeholder. */
var PLACEHOLDER = '__lodash_placeholder__';

/**
 * Replaces all `placeholder` elements in `array` with an internal placeholder
 * and returns an array of their indexes.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {*} placeholder The placeholder to replace.
 * @returns {Array} Returns the new array of placeholder indexes.
 */
function replaceHolders(array, placeholder) {
  var index = -1,
      length = array.length,
      resIndex = -1,
      result = [];

  while (++index < length) {
    if (array[index] === placeholder) {
      array[index] = PLACEHOLDER;
      result[++resIndex] = index;
    }
  }
  return result;
}

module.exports = replaceHolders;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash.restparam/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash.restparam/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash.restparam/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash.restparam/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/ampersand-state.js":[function(require,module,exports){
'use strict';
;if (typeof window !== "undefined") {  window.ampersand = window.ampersand || {};  window.ampersand["ampersand-state"] = window.ampersand["ampersand-state"] || [];  window.ampersand["ampersand-state"].push("4.9.1");}
var uniqueId = require('lodash.uniqueid');
var assign = require('lodash.assign');
var cloneObj = function(obj) { return assign({}, obj); };
var omit = require('lodash.omit');
var escape = require('lodash.escape');
var forOwn = require('lodash.forown');
var includes = require('lodash.includes');
var isString = require('lodash.isstring');
var isObject = require('lodash.isobject');
var isDate = require('lodash.isdate');
var isFunction = require('lodash.isfunction');
var _isEqual = require('lodash.isequal'); // to avoid shadowing
var has = require('lodash.has');
var result = require('lodash.result');
var bind = require('lodash.bind'); // because phantomjs doesn't have Function#bind
var union = require('lodash.union');
var Events = require('ampersand-events');
var KeyTree = require('key-tree-store');
var arrayNext = require('array-next');
var changeRE = /^change:/;
var noop = function () {};

function Base(attrs, options) {
    options || (options = {});
    this.cid || (this.cid = uniqueId('state'));
    this._events = {};
    this._values = {};
    this._definition = Object.create(this._definition);
    if (options.parse) attrs = this.parse(attrs, options);
    this.parent = options.parent;
    this.collection = options.collection;
    this._keyTree = new KeyTree();
    this._initCollections();
    this._initChildren();
    this._cache = {};
    this._previousAttributes = {};
    if (attrs) this.set(attrs, assign({silent: true, initial: true}, options));
    this._changed = {};
    if (this._derived) this._initDerived();
    if (options.init !== false) this.initialize.apply(this, arguments);
}

assign(Base.prototype, Events, {
    // can be allow, ignore, reject
    extraProperties: 'ignore',

    idAttribute: 'id',

    namespaceAttribute: 'namespace',

    typeAttribute: 'modelType',

    // Stubbed out to be overwritten
    initialize: function () {
        return this;
    },

    // Get ID of model per configuration.
    // Should *always* be how ID is determined by other code.
    getId: function () {
        return this[this.idAttribute];
    },

    // Get namespace of model per configuration.
    // Should *always* be how namespace is determined by other code.
    getNamespace: function () {
        return this[this.namespaceAttribute];
    },

    // Get type of model per configuration.
    // Should *always* be how type is determined by other code.
    getType: function () {
        return this[this.typeAttribute];
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function () {
        return this.getId() == null;
    },

    // get HTML-escaped value of attribute
    escape: function (attr) {
        return escape(this.get(attr));
    },

    // Check if the model is currently in a valid state.
    isValid: function (options) {
        return this._validate({}, assign(options || {}, { validate: true }));
    },

    // Parse can be used remap/restructure/rename incoming properties
    // before they are applied to attributes.
    parse: function (resp, options) {
        //jshint unused:false
        return resp;
    },

    // Serialize is the inverse of `parse` it lets you massage data
    // on the way out. Before, sending to server, for example.
    serialize: function (options) {
        var attrOpts = assign({props: true}, options);
        var res = this.getAttributes(attrOpts, true);
        forOwn(this._children, function (value, key) {
            res[key] = this[key].serialize();
        }, this);
        forOwn(this._collections, function (value, key) {
            res[key] = this[key].serialize();
        }, this);
        return res;
    },

    // Main set method used by generated setters/getters and can
    // be used directly if you need to pass options or set multiple
    // properties at once.
    set: function (key, value, options) {
        var self = this;
        var extraProperties = this.extraProperties;
        var wasChanging, changeEvents, newType, newVal, def, cast, err, attr,
            attrs, dataType, silent, unset, currentVal, initial, hasChanged, isEqual, onChange;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (isObject(key) || key === null) {
            attrs = key;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }

        options = options || {};

        if (!this._validate(attrs, options)) return false;

        // Extract attributes and options.
        unset = options.unset;
        silent = options.silent;
        initial = options.initial;

        // Initialize change tracking.
        wasChanging = this._changing;
        this._changing = true;
        changeEvents = [];

        // if not already changing, store previous
        if (initial) {
            this._previousAttributes = {};
        } else if (!wasChanging) {
            this._previousAttributes = this.attributes;
            this._changed = {};
        }

        // For each `set` attribute...
        for (var i = 0, keys = Object.keys(attrs), len = keys.length; i < len; i++) {
            attr = keys[i];
            newVal = attrs[attr];
            newType = typeof newVal;
            currentVal = this._values[attr];
            def = this._definition[attr];

            if (!def) {
                // if this is a child model or collection
                if (this._children[attr] || this._collections[attr]) {
                    if (!isObject(newVal)) {
                        newVal = {};
                    }

                    this[attr].set(newVal, options);
                    continue;
                } else if (extraProperties === 'ignore') {
                    continue;
                } else if (extraProperties === 'reject') {
                    throw new TypeError('No "' + attr + '" property defined on ' + (this.type || 'this') + ' model and extraProperties not set to "ignore" or "allow"');
                } else if (extraProperties === 'allow') {
                    def = this._createPropertyDefinition(attr, 'any');
                } else if (extraProperties) {
                    throw new TypeError('Invalid value for extraProperties: "' + extraProperties + '"');
                }
            }

            isEqual = this._getCompareForType(def.type);
            onChange = this._getOnChangeForType(def.type);
            dataType = this._dataTypes[def.type];

            // check type if we have one
            if (dataType && dataType.set) {
                cast = dataType.set(newVal);
                newVal = cast.val;
                newType = cast.type;
            }

            // If we've defined a test, run it
            if (def.test) {
                err = def.test.call(this, newVal, newType);
                if (err) {
                    throw new TypeError('Property \'' + attr + '\' failed validation with error: ' + err);
                }
            }

            // If we are required but undefined, throw error.
            // If we are null and are not allowing null, throw error
            // If we have a defined type and the new type doesn't match, and we are not null, throw error.
            // If we require specific value and new one is not one of them, throw error (unless it has default value or we're unsetting it with undefined).

            if (newVal === undefined && def.required) {
                throw new TypeError('Required property \'' + attr + '\' must be of type ' + def.type + '. Tried to set ' + newVal);
            }
            if (newVal === null && def.required && !def.allowNull) {
                throw new TypeError('Property \'' + attr + '\' must be of type ' + def.type + ' (cannot be null). Tried to set ' + newVal);
            }
            if ((def.type && def.type !== 'any' && def.type !== newType) && newVal !== null && newVal !== undefined) {
                throw new TypeError('Property \'' + attr + '\' must be of type ' + def.type + '. Tried to set ' + newVal);
            }
            if (def.values && !includes(def.values, newVal)) {
                var defaultValue = result(def, 'default');
                if (unset && defaultValue !== undefined) {
                    newVal = defaultValue;
                } else if (!unset || (unset && newVal !== undefined)) {
                    throw new TypeError('Property \'' + attr + '\' must be one of values: ' + def.values.join(', ') + '. Tried to set ' + newVal);
                }
            }

            // We know this has 'changed' if it's the initial set, so skip a potentially expensive isEqual check.
            hasChanged = initial || !isEqual(currentVal, newVal, attr);

            // enforce `setOnce` for properties if set
            if (def.setOnce && currentVal !== undefined && hasChanged) {
                throw new TypeError('Property \'' + attr + '\' can only be set once.');
            }

            // set/unset attributes.
            // If this is not the initial set, keep track of changed attributes
            // and push to changeEvents array so we can fire events.
            if (hasChanged) {

                // This fires no matter what, even on initial set.
                onChange(newVal, currentVal, attr);

                // If this is a change (not an initial set), mark the change.
                // Note it's impossible to unset on the initial set (it will already be unset),
                // so we only include that logic here.
                if (!initial) {
                    this._changed[attr] = newVal;
                    this._previousAttributes[attr] = currentVal;
                    if (unset) {
                        // FIXME delete is very slow. Can we get away with setting to undefined?
                        delete this._values[attr];
                    }
                    if (!silent) {
                        changeEvents.push({prev: currentVal, val: newVal, key: attr});
                    }
                }
                if (!unset) {
                    this._values[attr] = newVal;
                }
            } else {
                // Not changed
                // FIXME delete is very slow. Can we get away with setting to undefined?
                delete this._changed[attr];
            }
        }

        // Fire events. This array is not populated if we are told to be silent.
        if (changeEvents.length) this._pending = true;
        changeEvents.forEach(function (change) {
            self.trigger('change:' + change.key, self, change.val, options);
        });

        // You might be wondering why there's a `while` loop here. Changes can
        // be recursively nested within `"change"` events.
        if (wasChanging) return this;
        while (this._pending) {
            this._pending = false;
            this.trigger('change', this, options);
        }
        this._pending = false;
        this._changing = false;
        return this;
    },

    get: function (attr) {
        return this[attr];
    },

    // Toggle boolean properties or properties that have a `values`
    // array in its definition.
    toggle: function (property) {
        var def = this._definition[property];
        if (def.type === 'boolean') {
            // if it's a bool, just flip it
            this[property] = !this[property];
        } else if (def && def.values) {
            // If it's a property with an array of values
            // skip to the next one looping back if at end.
            this[property] = arrayNext(def.values, this[property]);
        } else {
            throw new TypeError('Can only toggle properties that are type `boolean` or have `values` array.');
        }
        return this;
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function () {
        return cloneObj(this._previousAttributes);
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function (attr) {
        if (attr == null) return !!Object.keys(this._changed).length;
        if (has(this._derived, attr)) {
            return this._derived[attr].depList.some(function (dep) {
                return this.hasChanged(dep);
            }, this);
        }
        return has(this._changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function (diff) {
        if (!diff) return this.hasChanged() ? cloneObj(this._changed) : false;
        var val, changed = false;
        var old = this._changing ? this._previousAttributes : this.attributes;
        var def, isEqual;
        for (var attr in diff) {
            def = this._definition[attr];
            if (!def) continue;
            isEqual = this._getCompareForType(def.type);
            if (isEqual(old[attr], (val = diff[attr]))) continue;
            (changed || (changed = {}))[attr] = val;
        }
        return changed;
    },

    toJSON: function () {
        return this.serialize();
    },

    unset: function (attrs, options) {
        var self = this;
        attrs = Array.isArray(attrs) ? attrs : [attrs];
        attrs.forEach(function (key) {
            var def = self._definition[key];
            if (!def) return;
            var val;
            if (def.required) {
                val = result(def, 'default');
                return self.set(key, val, options);
            } else {
                return self.set(key, val, assign({}, options, {unset: true}));
            }
        });
    },

    clear: function (options) {
        var self = this;
        Object.keys(this.attributes).forEach(function (key) {
            self.unset(key, options);
        });
        return this;
    },

    previous: function (attr) {
        if (attr == null || !Object.keys(this._previousAttributes).length) return null;
        return this._previousAttributes[attr];
    },

    // Get default values for a certain type
    _getDefaultForType: function (type) {
        var dataType = this._dataTypes[type];
        return dataType && dataType['default'];
    },

    // Determine which comparison algorithm to use for comparing a property
    _getCompareForType: function (type) {
        var dataType = this._dataTypes[type];
        if (dataType && dataType.compare) return bind(dataType.compare, this);
        return _isEqual; // if no compare function is defined, use _.isEqual
    },

    _getOnChangeForType : function(type){
        var dataType = this._dataTypes[type];
        if (dataType && dataType.onChange) return bind(dataType.onChange, this);
        return noop;
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function (attrs, options) {
        if (!options.validate || !this.validate) return true;
        attrs = assign({}, this.attributes, attrs);
        var error = this.validationError = this.validate(attrs, options) || null;
        if (!error) return true;
        this.trigger('invalid', this, error, assign(options || {}, {validationError: error}));
        return false;
    },

    _createPropertyDefinition: function (name, desc, isSession) {
        return createPropertyDefinition(this, name, desc, isSession);
    },

    // just makes friendlier errors when trying to define a new model
    // only used when setting up original property definitions
    _ensureValidType: function (type) {
        return includes(['string', 'number', 'boolean', 'array', 'object', 'date', 'state', 'any']
            .concat(Object.keys(this._dataTypes)), type) ? type : undefined;
    },

    getAttributes: function (options, raw) {
        options = assign({
            session: false,
            props: false,
            derived: false
        }, options || {});
        var res = {};
        var val, def;
        for (var item in this._definition) {
            def = this._definition[item];
            if ((options.session && def.session) || (options.props && !def.session)) {
                val = raw ? this._values[item] : this[item];
                if (raw && val && isFunction(val.serialize)) val = val.serialize();
                if (typeof val === 'undefined') val = result(def, 'default');
                if (typeof val !== 'undefined') res[item] = val;
            }
        }
        if (options.derived) {
            for (var derivedItem in this._derived) res[derivedItem] = this[derivedItem];
        }
        return res;
    },

    _initDerived: function () {
        var self = this;

        forOwn(this._derived, function (value, name) {
            var def = self._derived[name];
            def.deps = def.depList;

            var update = function (options) {
                options = options || {};

                var newVal = def.fn.call(self);

                if (self._cache[name] !== newVal || !def.cache) {
                    if (def.cache) {
                        self._previousAttributes[name] = self._cache[name];
                    }
                    self._cache[name] = newVal;
                    self.trigger('change:' + name, self, self._cache[name]);
                }
            };

            def.deps.forEach(function (propString) {
                self._keyTree.add(propString, update);
            });
        });

        this.on('all', function (eventName) {
            if (changeRE.test(eventName)) {
                self._keyTree.get(eventName.split(':')[1]).forEach(function (fn) {
                    fn();
                });
            }
        }, this);
    },

    _getDerivedProperty: function (name, flushCache) {
        // is this a derived property that is cached
        if (this._derived[name].cache) {
            //set if this is the first time, or flushCache is set
            if (flushCache || !this._cache.hasOwnProperty(name)) {
                this._cache[name] = this._derived[name].fn.apply(this);
            }
            return this._cache[name];
        } else {
            return this._derived[name].fn.apply(this);
        }
    },

    _initCollections: function () {
        var coll;
        if (!this._collections) return;
        for (coll in this._collections) {
            this._safeSet(coll, new this._collections[coll](null, {parent: this}));
        }
    },

    _initChildren: function () {
        var child;
        if (!this._children) return;
        for (child in this._children) {
            this._safeSet(child, new this._children[child]({}, {parent: this}));
            this.listenTo(this[child], 'all', this._getEventBubblingHandler(child));
        }
    },

    // Returns a bound handler for doing event bubbling while
    // adding a name to the change string.
    _getEventBubblingHandler: function (propertyName) {
        return bind(function (name, model, newValue) {
            if (changeRE.test(name)) {
                this.trigger('change:' + propertyName + '.' + name.split(':')[1], model, newValue);
            } else if (name === 'change') {
                this.trigger('change', this);
            }
        }, this);
    },

    // Check that all required attributes are present
    _verifyRequired: function () {
        var attrs = this.attributes; // should include session
        for (var def in this._definition) {
            if (this._definition[def].required && typeof attrs[def] === 'undefined') {
                return false;
            }
        }
        return true;
    },

    // expose safeSet method
    _safeSet: function safeSet(property, value) {
        if (property in this) {
            throw new Error('Encountered namespace collision while setting instance property `' + property + '`');
        }
        this[property] = value;
        return this;
    }
});

// getter for attributes
Object.defineProperties(Base.prototype, {
    attributes: {
        get: function () {
            return this.getAttributes({props: true, session: true});
        }
    },
    all: {
        get: function () {
            return this.getAttributes({
                session: true,
                props: true,
                derived: true
            });
        }
    },
    isState: {
        get: function () { return true; },
        set: function () { }
    }
});

// helper for creating/storing property definitions and creating
// appropriate getters/setters
function createPropertyDefinition(object, name, desc, isSession) {
    var def = object._definition[name] = {};
    var type, descArray;

    if (isString(desc)) {
        // grab our type if all we've got is a string
        type = object._ensureValidType(desc);
        if (type) def.type = type;
    } else {
        //Transform array of ['type', required, default] to object form
        if (Array.isArray(desc)) {
            descArray = desc;
            desc = {
                type: descArray[0],
                required: descArray[1],
                'default': descArray[2]
            };
        }

        type = object._ensureValidType(desc.type);
        if (type) def.type = type;

        if (desc.required) def.required = true;

        if (desc['default'] && typeof desc['default'] === 'object') {
            throw new TypeError('The default value for ' + name + ' cannot be an object/array, must be a value or a function which returns a value/object/array');
        }

        def['default'] = desc['default'];

        def.allowNull = desc.allowNull ? desc.allowNull : false;
        if (desc.setOnce) def.setOnce = true;
        if (def.required && def['default'] === undefined && !def.setOnce) def['default'] = object._getDefaultForType(type);
        def.test = desc.test;
        def.values = desc.values;
    }
    if (isSession) def.session = true;

    if (!type) {
        type = isString(desc) ? desc : desc.type;
        // TODO: start throwing a TypeError in future major versions instead of warning
        console.warn('Invalid data type of `' + type + '` for `' + name + '` property. Use one of the default types or define your own');
    }

    // define a getter/setter on the prototype
    // but they get/set on the instance
    Object.defineProperty(object, name, {
        set: function (val) {
            this.set(name, val);
        },
        get: function () {
            if (!this._values) {
                throw Error('You may be trying to `extend` a state object with "' + name + '" which has been defined in `props` on the object being extended');
            }
            var value = this._values[name];
            var typeDef = this._dataTypes[def.type];
            if (typeof value !== 'undefined') {
                if (typeDef && typeDef.get) {
                    value = typeDef.get(value);
                }
                return value;
            }
            var defaultValue = result(def, 'default');
            this._values[name] = defaultValue;
            // If we've set a defaultValue, fire a change handler effectively marking
            // its change from undefined to the default value.
            if (typeof defaultValue !== 'undefined') {
                var onChange = this._getOnChangeForType(def.type);
                onChange(defaultValue, value, name);
            }
            return defaultValue;
        }
    });

    return def;
}

// helper for creating derived property definitions
function createDerivedProperty(modelProto, name, definition) {
    var def = modelProto._derived[name] = {
        fn: isFunction(definition) ? definition : definition.fn,
        cache: (definition.cache !== false),
        depList: definition.deps || []
    };

    // add to our shared dependency list
    def.depList.forEach(function (dep) {
        modelProto._deps[dep] = union(modelProto._deps[dep] || [], [name]);
    });

    // defined a top-level getter for derived names
    Object.defineProperty(modelProto, name, {
        get: function () {
            return this._getDerivedProperty(name);
        },
        set: function () {
            throw new TypeError("`" + name + "` is a derived property, it can't be set directly.");
        }
    });
}

var dataTypes = {
    string: {
        'default': function () {
            return '';
        }
    },
    date: {
        set: function (newVal) {
            var newType;
            if (newVal == null) {
                newType = typeof null;
            } else if (!isDate(newVal)) {
                var err = null;
                var dateVal = new Date(newVal).valueOf();
                if (isNaN(dateVal)) {
                    // If the newVal cant be parsed, then try parseInt first
                    dateVal = new Date(parseInt(newVal, 10)).valueOf();
                    if (isNaN(dateVal)) err = true;
                }
                newVal = dateVal;
                newType = 'date';
                if (err) {
                    newType = typeof newVal;
                }
            } else {
                newType = 'date';
                newVal = newVal.valueOf();
            }

            return {
                val: newVal,
                type: newType
            };
        },
        get: function (val) {
            if (val == null) { return val; }
            return new Date(val);
        },
        'default': function () {
            return new Date();
        }
    },
    array: {
        set: function (newVal) {
            return {
                val: newVal,
                type: Array.isArray(newVal) ? 'array' : typeof newVal
            };
        },
        'default': function () {
            return [];
        }
    },
    object: {
        set: function (newVal) {
            var newType = typeof newVal;
            // we have to have a way of supporting "missing" objects.
            // Null is an object, but setting a value to undefined
            // should work too, IMO. We just override it, in that case.
            if (newType !== 'object' && newVal === undefined) {
                newVal = null;
                newType = 'object';
            }
            return {
                val: newVal,
                type: newType
            };
        },
        'default': function () {
            return {};
        }
    },
    // the `state` data type is a bit special in that setting it should
    // also bubble events
    state: {
        set: function (newVal) {
            var isInstance = newVal instanceof Base || (newVal && newVal.isState);
            if (isInstance) {
                return {
                    val: newVal,
                    type: 'state'
                };
            } else {
                return {
                    val: newVal,
                    type: typeof newVal
                };
            }
        },
        compare: function (currentVal, newVal) {
            return currentVal === newVal;
        },

        onChange : function(newVal, previousVal, attributeName){
            // if this has changed we want to also handle
            // event propagation
            if (previousVal) {
                this.stopListening(previousVal);
            }

            if (newVal != null) {
                this.listenTo(newVal, 'all', this._getEventBubblingHandler(attributeName));
            }
        }
    }
};

// the extend method used to extend prototypes, maintain inheritance chains for instanceof
// and allow for additions to the model definitions.
function extend(protoProps) {
    /*jshint validthis:true*/
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
    } else {
        child = function () {
            return parent.apply(this, arguments);
        };
    }

    // Add static properties to the constructor function from parent
    assign(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function () { this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // set prototype level objects
    child.prototype._derived =  assign({}, parent.prototype._derived);
    child.prototype._deps = assign({}, parent.prototype._deps);
    child.prototype._definition = assign({}, parent.prototype._definition);
    child.prototype._collections = assign({}, parent.prototype._collections);
    child.prototype._children = assign({}, parent.prototype._children);
    child.prototype._dataTypes = assign({}, parent.prototype._dataTypes || dataTypes);

    // Mix in all prototype properties to the subclass if supplied.
    if (protoProps) {
        var omitFromExtend = [
            'dataTypes', 'props', 'session', 'derived', 'collections', 'children'
        ];
        for(var i = 0; i < arguments.length; i++) {
            var def = arguments[i];
            if (def.dataTypes) {
                forOwn(def.dataTypes, function (def, name) {
                    child.prototype._dataTypes[name] = def;
                });
            }
            if (def.props) {
                forOwn(def.props, function (def, name) {
                    createPropertyDefinition(child.prototype, name, def);
                });
            }
            if (def.session) {
                forOwn(def.session, function (def, name) {
                    createPropertyDefinition(child.prototype, name, def, true);
                });
            }
            if (def.derived) {
                forOwn(def.derived, function (def, name) {
                    createDerivedProperty(child.prototype, name, def);
                });
            }
            if (def.collections) {
                forOwn(def.collections, function (constructor, name) {
                    child.prototype._collections[name] = constructor;
                });
            }
            if (def.children) {
                forOwn(def.children, function (constructor, name) {
                    child.prototype._children[name] = constructor;
                });
            }
            assign(child.prototype, omit(def, omitFromExtend));
        }
    }

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
}

Base.extend = extend;

// Our main exports
module.exports = Base;

},{"ampersand-events":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/ampersand-events/ampersand-events.js","array-next":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/array-next/array-next.js","key-tree-store":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/key-tree-store/key-tree-store.js","lodash.assign":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/index.js","lodash.bind":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.bind/index.js","lodash.escape":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.escape/index.js","lodash.forown":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/index.js","lodash.has":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/index.js","lodash.includes":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/index.js","lodash.isdate":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isdate/index.js","lodash.isequal":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isequal/index.js","lodash.isfunction":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.isfunction/index.js","lodash.isobject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isobject/index.js","lodash.isstring":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.isstring/index.js","lodash.omit":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/index.js","lodash.result":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/index.js","lodash.union":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/index.js","lodash.uniqueid":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.uniqueid/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/ampersand-events/ampersand-events.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/ampersand-events.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/ampersand-events.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/ampersand-events.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/array-next/array-next.js":[function(require,module,exports){
module.exports = function arrayNext(array, currentItem) {
    var len = array.length;
    var newIndex = array.indexOf(currentItem) + 1;
    if (newIndex > (len - 1)) newIndex = 0;
    return array[newIndex];
};

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/key-tree-store/key-tree-store.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/key-tree-store/key-tree-store.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/key-tree-store/key-tree-store.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/key-tree-store/key-tree-store.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.escape/index.js":[function(require,module,exports){
/**
 * lodash 3.2.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var root = require('lodash._root');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match HTML entities and HTML characters. */
var reUnescapedHtml = /[&<>"'`]/g,
    reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

/** Used to map characters to HTML entities. */
var htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;'
};

/**
 * Used by `_.escape` to convert characters to HTML entities.
 *
 * @private
 * @param {string} chr The matched character to escape.
 * @returns {string} Returns the escaped character.
 */
function escapeHtmlChar(chr) {
  return htmlEscapes[chr];
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var Symbol = root.Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = Symbol ? symbolProto.toString : undefined;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a string if it's not one. An empty string is returned
 * for `null` and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (value == null) {
    return '';
  }
  if (isSymbol(value)) {
    return Symbol ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Converts the characters "&", "<", ">", '"', "'", and "\`" in `string` to
 * their corresponding HTML entities.
 *
 * **Note:** No other characters are escaped. To escape additional
 * characters use a third-party library like [_he_](https://mths.be/he).
 *
 * Though the ">" character is escaped for symmetry, characters like
 * ">" and "/" don't need escaping in HTML and have no special meaning
 * unless they're part of a tag or unquoted attribute value.
 * See [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
 * (under "semi-related fun fact") for more details.
 *
 * Backticks are escaped because in IE < 9, they can break out of
 * attribute values or HTML comments. See [#59](https://html5sec.org/#59),
 * [#102](https://html5sec.org/#102), [#108](https://html5sec.org/#108), and
 * [#133](https://html5sec.org/#133) of the [HTML5 Security Cheatsheet](https://html5sec.org/)
 * for more details.
 *
 * When working with HTML you should always [quote attribute values](http://wonko.com/post/html-escaping)
 * to reduce XSS vectors.
 *
 * @static
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escape('fred, barney, & pebbles');
 * // => 'fred, barney, &amp; pebbles'
 */
function escape(string) {
  string = toString(string);
  return (string && reHasUnescapedHtml.test(string))
    ? string.replace(reUnescapedHtml, escapeHtmlChar)
    : string;
}

module.exports = escape;

},{"lodash._root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.escape/node_modules/lodash._root/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.escape/node_modules/lodash._root/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash._createwrapper/node_modules/lodash._root/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash._createwrapper/node_modules/lodash._root/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash._createwrapper/node_modules/lodash._root/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/index.js":[function(require,module,exports){
/**
 * lodash 3.0.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseFor = require('lodash._basefor'),
    bindCallback = require('lodash._bindcallback'),
    keys = require('lodash.keys');

/**
 * The base implementation of `_.forOwn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return baseFor(object, iteratee, keys);
}

/**
 * Creates a function for `_.forOwn` or `_.forOwnRight`.
 *
 * @private
 * @param {Function} objectFunc The function to iterate over an object.
 * @returns {Function} Returns the new each function.
 */
function createForOwn(objectFunc) {
  return function(object, iteratee, thisArg) {
    if (typeof iteratee != 'function' || thisArg !== undefined) {
      iteratee = bindCallback(iteratee, thisArg, 3);
    }
    return objectFunc(object, iteratee);
  };
}

/**
 * Iterates over own enumerable properties of an object invoking `iteratee`
 * for each property. The `iteratee` is bound to `thisArg` and invoked with
 * three arguments: (value, key, object). Iteratee functions may exit iteration
 * early by explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @param {*} [thisArg] The `this` binding of `iteratee`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.forOwn(new Foo, function(value, key) {
 *   console.log(key);
 * });
 * // => logs 'a' and 'b' (iteration order is not guaranteed)
 */
var forOwn = createForOwn(baseForOwn);

module.exports = forOwn;

},{"lodash._basefor":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/node_modules/lodash._basefor/index.js","lodash._bindcallback":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/node_modules/lodash._bindcallback/index.js","lodash.keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/node_modules/lodash.keys/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/node_modules/lodash._basefor/index.js":[function(require,module,exports){
/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * The base implementation of `baseForIn` and `baseForOwn` which iterates
 * over `object` properties returned by `keysFunc` invoking `iteratee` for
 * each property. Iteratee functions may exit iteration early by explicitly
 * returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * Creates a base function for methods like `_.forIn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = baseFor;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/node_modules/lodash._bindcallback/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/node_modules/lodash._bindcallback/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/node_modules/lodash._bindcallback/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/node_modules/lodash._bindcallback/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/node_modules/lodash.keys/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash.keys/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash.keys/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash.keys/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/index.js":[function(require,module,exports){
/**
 * lodash 3.2.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseGet = require('lodash._baseget'),
    baseSlice = require('lodash._baseslice'),
    toPath = require('lodash._topath'),
    isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray');

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  var type = typeof value;
  if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
    return true;
  }
  if (isArray(value)) {
    return false;
  }
  var result = !reIsDeepProp.test(value);
  return result || (object != null && value in toObject(object));
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array ? array.length : 0;
  return length ? array[length - 1] : undefined;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `path` is a direct property.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` is a direct property, else `false`.
 * @example
 *
 * var object = { 'a': { 'b': { 'c': 3 } } };
 *
 * _.has(object, 'a');
 * // => true
 *
 * _.has(object, 'a.b.c');
 * // => true
 *
 * _.has(object, ['a', 'b', 'c']);
 * // => true
 */
function has(object, path) {
  if (object == null) {
    return false;
  }
  var result = hasOwnProperty.call(object, path);
  if (!result && !isKey(path)) {
    path = toPath(path);
    object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
    if (object == null) {
      return false;
    }
    path = last(path);
    result = hasOwnProperty.call(object, path);
  }
  return result || (isLength(object.length) && isIndex(path, object.length) &&
    (isArray(object) || isArguments(object)));
}

module.exports = has;

},{"lodash._baseget":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash._baseget/index.js","lodash._baseslice":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash._baseslice/index.js","lodash._topath":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash._topath/index.js","lodash.isarguments":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash.isarguments/index.js","lodash.isarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash._baseget/index.js":[function(require,module,exports){
/**
 * lodash 3.7.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * The base implementation of `get` without support for string paths
 * and default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} path The path of the property to get.
 * @param {string} [pathKey] The key representation of path.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path, pathKey) {
  if (object == null) {
    return;
  }
  if (pathKey !== undefined && pathKey in toObject(object)) {
    path = [pathKey];
  }
  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[path[index++]];
  }
  return (index && index == length) ? object : undefined;
}

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = baseGet;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash._baseslice/index.js":[function(require,module,exports){
/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  start = start == null ? 0 : (+start || 0);
  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = (end === undefined || end > length) ? length : (+end || 0);
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

module.exports = baseSlice;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash._topath/index.js":[function(require,module,exports){
/**
 * lodash 3.8.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var isArray = require('lodash.isarray');

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `value` to a string if it's not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  return value == null ? '' : (value + '');
}

/**
 * Converts `value` to property path array if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Array} Returns the property path array.
 */
function toPath(value) {
  if (isArray(value)) {
    return value;
  }
  var result = [];
  baseToString(value).replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
}

module.exports = toPath;

},{"lodash.isarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash.isarguments/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._baseflatten/node_modules/lodash.isarguments/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._baseflatten/node_modules/lodash.isarguments/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._baseflatten/node_modules/lodash.isarguments/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/index.js":[function(require,module,exports){
/**
 * lodash 3.1.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseIndexOf = require('lodash._baseindexof'),
    baseValues = require('lodash._basevalues'),
    isIterateeCall = require('lodash._isiterateecall'),
    isArray = require('lodash.isarray'),
    isString = require('lodash.isstring'),
    keys = require('lodash.keys');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is in `collection` using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * for equality comparisons. If `fromIndex` is negative, it is used as the offset
 * from the end of `collection`.
 *
 * @static
 * @memberOf _
 * @alias contains, include
 * @category Collection
 * @param {Array|Object|string} collection The collection to search.
 * @param {*} target The value to search for.
 * @param {number} [fromIndex=0] The index to search from.
 * @param- {Object} [guard] Enables use as a callback for functions like `_.reduce`.
 * @returns {boolean} Returns `true` if a matching element is found, else `false`.
 * @example
 *
 * _.includes([1, 2, 3], 1);
 * // => true
 *
 * _.includes([1, 2, 3], 1, 2);
 * // => false
 *
 * _.includes({ 'user': 'fred', 'age': 40 }, 'fred');
 * // => true
 *
 * _.includes('pebbles', 'eb');
 * // => true
 */
function includes(collection, target, fromIndex, guard) {
  var length = collection ? getLength(collection) : 0;
  if (!isLength(length)) {
    collection = values(collection);
    length = collection.length;
  }
  if (typeof fromIndex != 'number' || (guard && isIterateeCall(target, fromIndex, guard))) {
    fromIndex = 0;
  } else {
    fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : (fromIndex || 0);
  }
  return (typeof collection == 'string' || !isArray(collection) && isString(collection))
    ? (fromIndex <= length && collection.indexOf(target, fromIndex) > -1)
    : (!!length && baseIndexOf(collection, target, fromIndex) > -1);
}

/**
 * Creates an array of the own enumerable property values of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property values.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.values(new Foo);
 * // => [1, 2] (iteration order is not guaranteed)
 *
 * _.values('hi');
 * // => ['h', 'i']
 */
function values(object) {
  return baseValues(object, keys(object));
}

module.exports = includes;

},{"lodash._baseindexof":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash._baseindexof/index.js","lodash._basevalues":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash._basevalues/index.js","lodash._isiterateecall":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash._isiterateecall/index.js","lodash.isarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isarray/index.js","lodash.isstring":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.isstring/index.js","lodash.keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash.keys/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash._baseindexof/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._baseindexof/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._baseindexof/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._baseindexof/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash._basevalues/index.js":[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * The base implementation of `_.values` and `_.valuesIn` which creates an
 * array of `object` property values corresponding to the property names
 * returned by `keysFunc`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} props The property names to get values for.
 * @returns {Object} Returns the array of property values.
 */
function baseValues(object, props) {
  var index = -1,
      length = props.length,
      result = Array(length);

  while (++index < length) {
    result[index] = object[props[index]];
  }
  return result;
}

module.exports = baseValues;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash._isiterateecall/index.js":[function(require,module,exports){
/**
 * lodash 3.0.9 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/**
 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if the provided arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
      ? (isArrayLike(object) && isIndex(index, object.length))
      : (type == 'string' && index in object)) {
    var other = object[index];
    return value === value ? (value === other) : (other !== other);
  }
  return false;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isIterateeCall;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash.keys/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/node_modules/lodash.keys/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/node_modules/lodash.keys/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/node_modules/lodash.keys/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isarray/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash.isarray/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash.isarray/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isdate/index.js":[function(require,module,exports){
/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var dateTag = '[object Date]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Date` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isDate(new Date);
 * // => true
 *
 * _.isDate('Mon April 23 2012');
 * // => false
 */
function isDate(value) {
  return isObjectLike(value) && objectToString.call(value) == dateTag;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isDate;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isequal/index.js":[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseIsEqual = require('lodash._baseisequal'),
    bindCallback = require('lodash._bindcallback');

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent. If `customizer` is provided it is invoked to compare values.
 * If `customizer` returns `undefined` comparisons are handled by the method
 * instead. The `customizer` is bound to `thisArg` and invoked with three
 * arguments: (value, other [, index|key]).
 *
 * **Note:** This method supports comparing arrays, booleans, `Date` objects,
 * numbers, `Object` objects, regexes, and strings. Objects are compared by
 * their own, not inherited, enumerable properties. Functions and DOM nodes
 * are **not** supported. Provide a customizer function to extend support
 * for comparing other values.
 *
 * @static
 * @memberOf _
 * @alias eq
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize value comparisons.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'user': 'fred' };
 * var other = { 'user': 'fred' };
 *
 * object == other;
 * // => false
 *
 * _.isEqual(object, other);
 * // => true
 *
 * // using a customizer callback
 * var array = ['hello', 'goodbye'];
 * var other = ['hi', 'goodbye'];
 *
 * _.isEqual(array, other, function(value, other) {
 *   if (_.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/)) {
 *     return true;
 *   }
 * });
 * // => true
 */
function isEqual(value, other, customizer, thisArg) {
  customizer = typeof customizer == 'function' ? bindCallback(customizer, thisArg, 3) : undefined;
  var result = customizer ? customizer(value, other) : undefined;
  return  result === undefined ? baseIsEqual(value, other, customizer) : !!result;
}

module.exports = isEqual;

},{"lodash._baseisequal":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isequal/node_modules/lodash._baseisequal/index.js","lodash._bindcallback":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isequal/node_modules/lodash._bindcallback/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isequal/node_modules/lodash._baseisequal/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/node_modules/lodash._baseisequal/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/node_modules/lodash._baseisequal/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._basecallback/node_modules/lodash._baseisequal/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isequal/node_modules/lodash._bindcallback/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/node_modules/lodash._bindcallback/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/node_modules/lodash._bindcallback/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/node_modules/lodash._bindcallback/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isobject/index.js":[function(require,module,exports){
/**
 * lodash 3.0.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/index.js":[function(require,module,exports){
/**
 * lodash 3.1.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var arrayMap = require('lodash._arraymap'),
    baseDifference = require('lodash._basedifference'),
    baseFlatten = require('lodash._baseflatten'),
    bindCallback = require('lodash._bindcallback'),
    pickByArray = require('lodash._pickbyarray'),
    pickByCallback = require('lodash._pickbycallback'),
    keysIn = require('lodash.keysin'),
    restParam = require('lodash.restparam');

/**
 * The opposite of `_.pick`; this method creates an object composed of the
 * own and inherited enumerable properties of `object` that are not omitted.
 * Property names may be specified as individual arguments or as arrays of
 * property names. If `predicate` is provided it is invoked for each property
 * of `object` omitting the properties `predicate` returns truthy for. The
 * predicate is bound to `thisArg` and invoked with three arguments:
 * (value, key, object).
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {Function|...(string|string[])} [predicate] The function invoked per
 *  iteration or property names to omit, specified as individual property
 *  names or arrays of property names.
 * @param {*} [thisArg] The `this` binding of `predicate`.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'user': 'fred', 'age': 40 };
 *
 * _.omit(object, 'age');
 * // => { 'user': 'fred' }
 *
 * _.omit(object, _.isNumber);
 * // => { 'user': 'fred' }
 */
var omit = restParam(function(object, props) {
  if (object == null) {
    return {};
  }
  if (typeof props[0] != 'function') {
    var props = arrayMap(baseFlatten(props), String);
    return pickByArray(object, baseDifference(keysIn(object), props));
  }
  var predicate = bindCallback(props[0], props[1], 3);
  return pickByCallback(object, function(value, key, object) {
    return !predicate(value, key, object);
  });
});

module.exports = omit;

},{"lodash._arraymap":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._arraymap/index.js","lodash._basedifference":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._basedifference/index.js","lodash._baseflatten":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._baseflatten/index.js","lodash._bindcallback":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._bindcallback/index.js","lodash._pickbyarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._pickbyarray/index.js","lodash._pickbycallback":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._pickbycallback/index.js","lodash.keysin":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash.keysin/index.js","lodash.restparam":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash.restparam/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._arraymap/index.js":[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `_.map` for arrays without support for callback
 * shorthands or `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._basedifference/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._baseflatten/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._baseflatten/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._baseflatten/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._baseflatten/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._bindcallback/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isequal/node_modules/lodash._bindcallback/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isequal/node_modules/lodash._bindcallback/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isequal/node_modules/lodash._bindcallback/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._pickbyarray/index.js":[function(require,module,exports){
/**
 * lodash 3.0.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `_.pick` which picks `object` properties specified
 * by `props`.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} props The property names to pick.
 * @returns {Object} Returns the new object.
 */
function pickByArray(object, props) {
  object = toObject(object);

  var index = -1,
      length = props.length,
      result = {};

  while (++index < length) {
    var key = props[index];
    if (key in object) {
      result[key] = object[key];
    }
  }
  return result;
}

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = pickByArray;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._pickbycallback/index.js":[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseFor = require('lodash._basefor'),
    keysIn = require('lodash.keysin');

/**
 * The base implementation of `_.forIn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForIn(object, iteratee) {
  return baseFor(object, iteratee, keysIn);
}

/**
 * A specialized version of `_.pick` that picks `object` properties `predicate`
 * returns truthy for.
 *
 * @private
 * @param {Object} object The source object.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Object} Returns the new object.
 */
function pickByCallback(object, predicate) {
  var result = {};
  baseForIn(object, function(value, key, object) {
    if (predicate(value, key, object)) {
      result[key] = value;
    }
  });
  return result;
}

module.exports = pickByCallback;

},{"lodash._basefor":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._pickbycallback/node_modules/lodash._basefor/index.js","lodash.keysin":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash.keysin/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._pickbycallback/node_modules/lodash._basefor/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/node_modules/lodash._basefor/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/node_modules/lodash._basefor/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.forown/node_modules/lodash._basefor/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash.keysin/index.js":[function(require,module,exports){
/**
 * lodash 3.0.8 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray');

/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = (length && isLength(length) &&
    (isArray(object) || isArguments(object)) && length) || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = (index + '');
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keysIn;

},{"lodash.isarguments":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash.keysin/node_modules/lodash.isarguments/index.js","lodash.isarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash.keysin/node_modules/lodash.isarguments/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash.isarguments/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash.isarguments/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash.isarguments/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash.restparam/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash.restparam/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash.restparam/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash.restparam/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/index.js":[function(require,module,exports){
/**
 * lodash 3.1.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseFlatten = require('lodash._baseflatten'),
    baseUniq = require('lodash._baseuniq'),
    restParam = require('lodash.restparam');

/**
 * Creates an array of unique values, in order, of the provided arrays using
 * `SameValueZero` for equality comparisons.
 *
 * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
 * comparisons are like strict equality comparisons, e.g. `===`, except that
 * `NaN` matches `NaN`.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @returns {Array} Returns the new array of combined values.
 * @example
 *
 * _.union([1, 2], [4, 2], [2, 1]);
 * // => [1, 2, 4]
 */
var union = restParam(function(arrays) {
  return baseUniq(baseFlatten(arrays, false, true));
});

module.exports = union;

},{"lodash._baseflatten":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash._baseflatten/index.js","lodash._baseuniq":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash._baseuniq/index.js","lodash.restparam":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash.restparam/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash._baseflatten/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._baseflatten/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._baseflatten/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._baseflatten/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash._baseuniq/index.js":[function(require,module,exports){
/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseIndexOf = require('lodash._baseindexof'),
    cacheIndexOf = require('lodash._cacheindexof'),
    createCache = require('lodash._createcache');

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * The base implementation of `_.uniq` without support for callback shorthands
 * and `this` binding.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The function invoked per iteration.
 * @returns {Array} Returns the new duplicate-value-free array.
 */
function baseUniq(array, iteratee) {
  var index = -1,
      indexOf = baseIndexOf,
      length = array.length,
      isCommon = true,
      isLarge = isCommon && length >= LARGE_ARRAY_SIZE,
      seen = isLarge ? createCache() : null,
      result = [];

  if (seen) {
    indexOf = cacheIndexOf;
    isCommon = false;
  } else {
    isLarge = false;
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value, index, array) : value;

    if (isCommon && value === value) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (indexOf(seen, computed, 0) < 0) {
      if (iteratee || isLarge) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

module.exports = baseUniq;

},{"lodash._baseindexof":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._baseindexof/index.js","lodash._cacheindexof":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._cacheindexof/index.js","lodash._createcache":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._createcache/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._baseindexof/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash._baseindexof/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash._baseindexof/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash._baseindexof/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._cacheindexof/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._cacheindexof/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._cacheindexof/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._cacheindexof/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._createcache/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._createcache/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._createcache/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.difference/node_modules/lodash._basedifference/node_modules/lodash._createcache/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash.restparam/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash.restparam/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash.restparam/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash.restparam/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/domify/index.js":[function(require,module,exports){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Tests for browser support.
 */

var innerHTMLBug = false;
var bugTestDiv;
if (typeof document !== 'undefined') {
  bugTestDiv = document.createElement('div');
  // Setup
  bugTestDiv.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
  // Make sure that link elements get serialized correctly by innerHTML
  // This requires a wrapper element in IE
  innerHTMLBug = !bugTestDiv.getElementsByTagName('link').length;
  bugTestDiv = undefined;
}

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  // for script/link/style tags to work in IE6-8, you have to wrap
  // in a div with a non-whitespace character in front, ha!
  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.polyline =
map.ellipse =
map.polygon =
map.circle =
map.text =
map.line =
map.path =
map.rect =
map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/events-mixin/index.js":[function(require,module,exports){

/**
 * Module dependencies.
 */

var events = require('component-event');
var delegate = require('delegate-events');
var forceCaptureEvents = ['focus', 'blur'];

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 *  Multiple events handling:
 *
 *    events.bind({
 *      'click .remove': 'remove',
 *      'click .add': 'add'
 *    });
 *
 * @param {String|object} - object is used for multiple binding,
 *                               string for single event binding
 * @param {String|function} [arg2] - method to call (optional)
 * @param {*} [arg3] - data for single event binding (optional)
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(arg1, arg2){
  var bindEvent = function(event, method) {
    var e = parse(event);
    var el = this.el;
    var obj = this.obj;
    var name = e.name;
    var method = method || 'on' + name;
    var args = [].slice.call(arguments, 2);

    // callback
    function cb(){
      var a = [].slice.call(arguments).concat(args);

      if (typeof method === 'function') {
          method.apply(obj, a);
          return;
      }

      if (!obj[method]) {
          throw new Error(method + ' method is not defined');
      } else {
          obj[method].apply(obj, a);
      }
    }

    // bind
    if (e.selector) {
      cb = delegate.bind(el, e.selector, name, cb);
    } else {
      events.bind(el, name, cb);
    }

    // subscription for unbinding
    this.sub(name, method, cb);

    return cb;
  };

  if (typeof arg1 == 'string') {
    bindEvent.apply(this, arguments);
  } else {
    for(var key in arg1) {
      if (arg1.hasOwnProperty(key)) {
        bindEvent.call(this, key, arg1[key]);
      }
    }
  }
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  var capture = (forceCaptureEvents.indexOf(event) !== -1);
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb, capture);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

},{"component-event":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/events-mixin/node_modules/component-event/index.js","delegate-events":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/events-mixin/node_modules/delegate-events/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/events-mixin/node_modules/component-event/index.js":[function(require,module,exports){
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/events-mixin/node_modules/delegate-events/index.js":[function(require,module,exports){
/**
 * Module dependencies.
 */

var closest = require('closest')
  , event = require('component-event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

// Some events don't bubble, so we want to bind to the capture phase instead
// when delegating.
var forceCaptureEvents = ['focus', 'blur'];

exports.bind = function(el, selector, type, fn, capture){
  if (forceCaptureEvents.indexOf(type) !== -1) capture = true;

  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (forceCaptureEvents.indexOf(type) !== -1) capture = true;

  event.unbind(el, type, fn, capture);
};

},{"closest":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/events-mixin/node_modules/delegate-events/node_modules/closest/index.js","component-event":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/events-mixin/node_modules/component-event/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/events-mixin/node_modules/delegate-events/node_modules/closest/index.js":[function(require,module,exports){
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf) {
  var parent = checkYoSelf ? element : element.parentNode

  while (parent && parent !== document) {
    if (matches(parent, selector)) return parent;
    parent = parent.parentNode
  }
}

},{"matches-selector":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/events-mixin/node_modules/delegate-events/node_modules/closest/node_modules/matches-selector/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/events-mixin/node_modules/delegate-events/node_modules/closest/node_modules/matches-selector/index.js":[function(require,module,exports){

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = el.parentNode.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}
},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/index.js":[function(require,module,exports){
/**
 * lodash 3.2.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseAssign = require('lodash._baseassign'),
    createAssigner = require('lodash._createassigner'),
    keys = require('lodash.keys');

/**
 * A specialized version of `_.assign` for customizing assigned values without
 * support for argument juggling, multiple sources, and `this` binding `customizer`
 * functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 */
function assignWith(object, source, customizer) {
  var index = -1,
      props = keys(source),
      length = props.length;

  while (++index < length) {
    var key = props[index],
        value = object[key],
        result = customizer(value, source[key], key, object, source);

    if ((result === result ? (result !== value) : (value === value)) ||
        (value === undefined && !(key in object))) {
      object[key] = result;
    }
  }
  return object;
}

/**
 * Assigns own enumerable properties of source object(s) to the destination
 * object. Subsequent sources overwrite property assignments of previous sources.
 * If `customizer` is provided it is invoked to produce the assigned values.
 * The `customizer` is bound to `thisArg` and invoked with five arguments:
 * (objectValue, sourceValue, key, object, source).
 *
 * **Note:** This method mutates `object` and is based on
 * [`Object.assign`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign).
 *
 * @static
 * @memberOf _
 * @alias extend
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
 * // => { 'user': 'fred', 'age': 40 }
 *
 * // using a customizer callback
 * var defaults = _.partialRight(_.assign, function(value, other) {
 *   return _.isUndefined(value) ? other : value;
 * });
 *
 * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
 * // => { 'user': 'barney', 'age': 36 }
 */
var assign = createAssigner(function(object, source, customizer) {
  return customizer
    ? assignWith(object, source, customizer)
    : baseAssign(object, source);
});

module.exports = assign;

},{"lodash._baseassign":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._baseassign/index.js","lodash._createassigner":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/index.js","lodash.keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash.keys/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._baseassign/index.js":[function(require,module,exports){
/**
 * lodash 3.2.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseCopy = require('lodash._basecopy'),
    keys = require('lodash.keys');

/**
 * The base implementation of `_.assign` without support for argument juggling,
 * multiple sources, and `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return source == null
    ? object
    : baseCopy(source, keys(source), object);
}

module.exports = baseAssign;

},{"lodash._basecopy":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._baseassign/node_modules/lodash._basecopy/index.js","lodash.keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash.keys/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._baseassign/node_modules/lodash._basecopy/index.js":[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property names to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @returns {Object} Returns `object`.
 */
function baseCopy(source, props, object) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    object[key] = source[key];
  }
  return object;
}

module.exports = baseCopy;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/index.js":[function(require,module,exports){
/**
 * lodash 3.1.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var bindCallback = require('lodash._bindcallback'),
    isIterateeCall = require('lodash._isiterateecall'),
    restParam = require('lodash.restparam');

/**
 * Creates a function that assigns properties of source object(s) to a given
 * destination object.
 *
 * **Note:** This function is used to create `_.assign`, `_.defaults`, and `_.merge`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return restParam(function(object, sources) {
    var index = -1,
        length = object == null ? 0 : sources.length,
        customizer = length > 2 ? sources[length - 2] : undefined,
        guard = length > 2 ? sources[2] : undefined,
        thisArg = length > 1 ? sources[length - 1] : undefined;

    if (typeof customizer == 'function') {
      customizer = bindCallback(customizer, thisArg, 5);
      length -= 2;
    } else {
      customizer = typeof thisArg == 'function' ? thisArg : undefined;
      length -= (customizer ? 1 : 0);
    }
    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;

},{"lodash._bindcallback":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/node_modules/lodash._bindcallback/index.js","lodash._isiterateecall":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/node_modules/lodash._isiterateecall/index.js","lodash.restparam":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/node_modules/lodash.restparam/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/node_modules/lodash._bindcallback/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._bindcallback/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._bindcallback/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._bindcallback/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/node_modules/lodash._isiterateecall/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash._isiterateecall/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash._isiterateecall/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash._isiterateecall/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/node_modules/lodash.restparam/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash.restparam/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash.restparam/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash.restparam/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash.keys/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash.keys/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash.keys/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.includes/node_modules/lodash.keys/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.bind/index.js":[function(require,module,exports){
/**
 * lodash 3.1.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var createWrapper = require('lodash._createwrapper'),
    replaceHolders = require('lodash._replaceholders'),
    restParam = require('lodash.restparam');

/** Used to compose bitmasks for wrapper metadata. */
var BIND_FLAG = 1,
    PARTIAL_FLAG = 32;

/**
 * Creates a function that invokes `func` with the `this` binding of `thisArg`
 * and prepends any additional `_.bind` arguments to those provided to the
 * bound function.
 *
 * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
 * may be used as a placeholder for partially applied arguments.
 *
 * **Note:** Unlike native `Function#bind` this method does not set the `length`
 * property of bound functions.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to bind.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {...*} [partials] The arguments to be partially applied.
 * @returns {Function} Returns the new bound function.
 * @example
 *
 * var greet = function(greeting, punctuation) {
 *   return greeting + ' ' + this.user + punctuation;
 * };
 *
 * var object = { 'user': 'fred' };
 *
 * var bound = _.bind(greet, object, 'hi');
 * bound('!');
 * // => 'hi fred!'
 *
 * // using placeholders
 * var bound = _.bind(greet, object, _, '!');
 * bound('hi');
 * // => 'hi fred!'
 */
var bind = restParam(function(func, thisArg, partials) {
  var bitmask = BIND_FLAG;
  if (partials.length) {
    var holders = replaceHolders(partials, bind.placeholder);
    bitmask |= PARTIAL_FLAG;
  }
  return createWrapper(func, bitmask, thisArg, partials, holders);
});

// Assign default placeholders.
bind.placeholder = {};

module.exports = bind;

},{"lodash._createwrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.bind/node_modules/lodash._createwrapper/index.js","lodash._replaceholders":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.bind/node_modules/lodash._replaceholders/index.js","lodash.restparam":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.bind/node_modules/lodash.restparam/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.bind/node_modules/lodash._createwrapper/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash._createwrapper/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash._createwrapper/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash._createwrapper/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.bind/node_modules/lodash._replaceholders/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash._replaceholders/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash._replaceholders/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/lodash.partial/node_modules/lodash._replaceholders/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.bind/node_modules/lodash.restparam/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/node_modules/lodash.restparam/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/node_modules/lodash.restparam/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/node_modules/lodash.restparam/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.flatten/index.js":[function(require,module,exports){
/**
 * lodash 3.0.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseFlatten = require('lodash._baseflatten'),
    isIterateeCall = require('lodash._isiterateecall');

/**
 * Flattens a nested array. If `isDeep` is `true` the array is recursively
 * flattened, otherwise it is only flattened a single level.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to flatten.
 * @param {boolean} [isDeep] Specify a deep flatten.
 * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * _.flatten([1, [2, 3, [4]]]);
 * // => [1, 2, 3, [4]]
 *
 * // using `isDeep`
 * _.flatten([1, [2, 3, [4]]], true);
 * // => [1, 2, 3, 4]
 */
function flatten(array, isDeep, guard) {
  var length = array ? array.length : 0;
  if (guard && isIterateeCall(array, isDeep, guard)) {
    isDeep = false;
  }
  return length ? baseFlatten(array, isDeep) : [];
}

module.exports = flatten;

},{"lodash._baseflatten":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.flatten/node_modules/lodash._baseflatten/index.js","lodash._isiterateecall":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.flatten/node_modules/lodash._isiterateecall/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.flatten/node_modules/lodash._baseflatten/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash._baseflatten/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash._baseflatten/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.union/node_modules/lodash._baseflatten/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.flatten/node_modules/lodash._isiterateecall/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/node_modules/lodash._isiterateecall/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/node_modules/lodash._isiterateecall/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/node_modules/lodash._isiterateecall/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/index.js":[function(require,module,exports){
/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var arrayEach = require('lodash._arrayeach'),
    baseEach = require('lodash._baseeach'),
    bindCallback = require('lodash._bindcallback'),
    isArray = require('lodash.isarray');

/**
 * Creates a function for `_.forEach` or `_.forEachRight`.
 *
 * @private
 * @param {Function} arrayFunc The function to iterate over an array.
 * @param {Function} eachFunc The function to iterate over a collection.
 * @returns {Function} Returns the new each function.
 */
function createForEach(arrayFunc, eachFunc) {
  return function(collection, iteratee, thisArg) {
    return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
      ? arrayFunc(collection, iteratee)
      : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
  };
}

/**
 * Iterates over elements of `collection` invoking `iteratee` for each element.
 * The `iteratee` is bound to `thisArg` and invoked with three arguments:
 * (value, index|key, collection). Iteratee functions may exit iteration early
 * by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a "length" property
 * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
 * may be used for object iteration.
 *
 * @static
 * @memberOf _
 * @alias each
 * @category Collection
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @param {*} [thisArg] The `this` binding of `iteratee`.
 * @returns {Array|Object|string} Returns `collection`.
 * @example
 *
 * _([1, 2]).forEach(function(n) {
 *   console.log(n);
 * }).value();
 * // => logs each value from left to right and returns the array
 *
 * _.forEach({ 'a': 1, 'b': 2 }, function(n, key) {
 *   console.log(n, key);
 * });
 * // => logs each value-key pair and returns the object (iteration order is not guaranteed)
 */
var forEach = createForEach(arrayEach, baseEach);

module.exports = forEach;

},{"lodash._arrayeach":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash._arrayeach/index.js","lodash._baseeach":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash._baseeach/index.js","lodash._bindcallback":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash._bindcallback/index.js","lodash.isarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash._arrayeach/index.js":[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `_.forEach` for arrays without support for callback
 * shorthands or `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash._baseeach/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._baseeach/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._baseeach/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/lodash.find/node_modules/lodash._baseeach/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash._bindcallback/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/node_modules/lodash._bindcallback/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/node_modules/lodash._bindcallback/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.assign/node_modules/lodash._createassigner/node_modules/lodash._bindcallback/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash.isarray/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isarray/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isarray/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.get/index.js":[function(require,module,exports){
/**
 * lodash 3.7.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseGet = require('lodash._baseget'),
    toPath = require('lodash._topath');

/**
 * Gets the property value of `path` on `object`. If the resolved value is
 * `undefined` the `defaultValue` is used in its place.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned if the resolved value is `undefined`.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, toPath(path), path + '');
  return result === undefined ? defaultValue : result;
}

module.exports = get;

},{"lodash._baseget":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.get/node_modules/lodash._baseget/index.js","lodash._topath":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.get/node_modules/lodash._topath/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.get/node_modules/lodash._baseget/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash._baseget/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash._baseget/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash._baseget/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.get/node_modules/lodash._topath/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash._topath/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash._topath/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash._topath/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/index.js":[function(require,module,exports){
/**
 * lodash 3.2.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseEach = require('lodash._baseeach'),
    invokePath = require('lodash._invokepath'),
    isArray = require('lodash.isarray'),
    restParam = require('lodash.restparam');

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  var type = typeof value;
  if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
    return true;
  }
  if (isArray(value)) {
    return false;
  }
  var result = !reIsDeepProp.test(value);
  return result || (object != null && value in toObject(object));
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

/**
 * Invokes the method at `path` of each element in `collection`, returning
 * an array of the results of each invoked method. Any additional arguments
 * are provided to each invoked method. If `methodName` is a function it is
 * invoked for, and `this` bound to, each element in `collection`.
 *
 * @static
 * @memberOf _
 * @category Collection
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Array|Function|string} path The path of the method to invoke or
 *  the function invoked per iteration.
 * @param {...*} [args] The arguments to invoke the method with.
 * @returns {Array} Returns the array of results.
 * @example
 *
 * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
 * // => [[1, 5, 7], [1, 2, 3]]
 *
 * _.invoke([123, 456], String.prototype.split, '');
 * // => [['1', '2', '3'], ['4', '5', '6']]
 */
var invoke = restParam(function(collection, path, args) {
  var index = -1,
      isFunc = typeof path == 'function',
      isProp = isKey(path),
      result = isArrayLike(collection) ? Array(collection.length) : [];

  baseEach(collection, function(value) {
    var func = isFunc ? path : ((isProp && value != null) ? value[path] : undefined);
    result[++index] = func ? func.apply(value, args) : invokePath(value, path, args);
  });
  return result;
});

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = invoke;

},{"lodash._baseeach":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._baseeach/index.js","lodash._invokepath":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/index.js","lodash.isarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash.isarray/index.js","lodash.restparam":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash.restparam/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._baseeach/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash._baseeach/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash._baseeach/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash._baseeach/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/index.js":[function(require,module,exports){
/**
 * lodash 3.7.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseGet = require('lodash._baseget'),
    baseSlice = require('lodash._baseslice'),
    toPath = require('lodash._topath'),
    isArray = require('lodash.isarray');

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Invokes the method at `path` on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the method to invoke.
 * @param {Array} args The arguments to invoke the method with.
 * @returns {*} Returns the result of the invoked method.
 */
function invokePath(object, path, args) {
  if (object != null && !isKey(path, object)) {
    path = toPath(path);
    object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
    path = last(path);
  }
  var func = object == null ? object : object[path];
  return func == null ? undefined : func.apply(object, args);
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  var type = typeof value;
  if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
    return true;
  }
  if (isArray(value)) {
    return false;
  }
  var result = !reIsDeepProp.test(value);
  return result || (object != null && value in toObject(object));
}

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array ? array.length : 0;
  return length ? array[length - 1] : undefined;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = invokePath;

},{"lodash._baseget":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/node_modules/lodash._baseget/index.js","lodash._baseslice":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/node_modules/lodash._baseslice/index.js","lodash._topath":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/node_modules/lodash._topath/index.js","lodash.isarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/node_modules/lodash._baseget/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.get/node_modules/lodash._baseget/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.get/node_modules/lodash._baseget/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.get/node_modules/lodash._baseget/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/node_modules/lodash._baseslice/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash._baseslice/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash._baseslice/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.has/node_modules/lodash._baseslice/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/node_modules/lodash._topath/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.get/node_modules/lodash._topath/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.get/node_modules/lodash._topath/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.get/node_modules/lodash._topath/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash.isarray/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash.isarray/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash.isarray/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash.restparam/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.bind/node_modules/lodash.restparam/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.bind/node_modules/lodash.restparam/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.bind/node_modules/lodash.restparam/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.isstring/index.js":[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var stringTag = '[object String]';

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag);
}

module.exports = isString;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.last/index.js":[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array ? array.length : 0;
  return length ? array[length - 1] : undefined;
}

module.exports = last;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.pick/index.js":[function(require,module,exports){
/**
 * lodash 3.1.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseFlatten = require('lodash._baseflatten'),
    bindCallback = require('lodash._bindcallback'),
    pickByArray = require('lodash._pickbyarray'),
    pickByCallback = require('lodash._pickbycallback'),
    restParam = require('lodash.restparam');

/**
 * Creates an object composed of the picked `object` properties. Property
 * names may be specified as individual arguments or as arrays of property
 * names. If `predicate` is provided it is invoked for each property of `object`
 * picking the properties `predicate` returns truthy for. The predicate is
 * bound to `thisArg` and invoked with three arguments: (value, key, object).
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {Function|...(string|string[])} [predicate] The function invoked per
 *  iteration or property names to pick, specified as individual property
 *  names or arrays of property names.
 * @param {*} [thisArg] The `this` binding of `predicate`.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'user': 'fred', 'age': 40 };
 *
 * _.pick(object, 'user');
 * // => { 'user': 'fred' }
 *
 * _.pick(object, _.isString);
 * // => { 'user': 'fred' }
 */
var pick = restParam(function(object, props) {
  if (object == null) {
    return {};
  }
  return typeof props[0] == 'function'
    ? pickByCallback(object, bindCallback(props[0], props[1], 3))
    : pickByArray(object, baseFlatten(props));
});

module.exports = pick;

},{"lodash._baseflatten":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.pick/node_modules/lodash._baseflatten/index.js","lodash._bindcallback":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.pick/node_modules/lodash._bindcallback/index.js","lodash._pickbyarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.pick/node_modules/lodash._pickbyarray/index.js","lodash._pickbycallback":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.pick/node_modules/lodash._pickbycallback/index.js","lodash.restparam":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.pick/node_modules/lodash.restparam/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.pick/node_modules/lodash._baseflatten/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.flatten/node_modules/lodash._baseflatten/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.flatten/node_modules/lodash._baseflatten/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.flatten/node_modules/lodash._baseflatten/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.pick/node_modules/lodash._bindcallback/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash._bindcallback/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash._bindcallback/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.foreach/node_modules/lodash._bindcallback/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.pick/node_modules/lodash._pickbyarray/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._pickbyarray/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._pickbyarray/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._pickbyarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.pick/node_modules/lodash._pickbycallback/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._pickbycallback/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._pickbycallback/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.omit/node_modules/lodash._pickbycallback/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.pick/node_modules/lodash.restparam/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash.restparam/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash.restparam/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash.restparam/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.uniqueid/index.js":[function(require,module,exports){
/**
 * lodash 3.2.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var root = require('lodash._root');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to generate unique IDs. */
var idCounter = 0;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var Symbol = root.Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = Symbol ? symbolProto.toString : undefined;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a string if it's not one. An empty string is returned
 * for `null` and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (value == null) {
    return '';
  }
  if (isSymbol(value)) {
    return Symbol ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Generates a unique ID. If `prefix` is provided the ID is appended to it.
 *
 * @static
 * @memberOf _
 * @category Util
 * @param {string} [prefix] The value to prefix the ID with.
 * @returns {string} Returns the unique ID.
 * @example
 *
 * _.uniqueId('contact_');
 * // => 'contact_104'
 *
 * _.uniqueId();
 * // => '105'
 */
function uniqueId(prefix) {
  var id = ++idCounter;
  return toString(prefix) + id;
}

module.exports = uniqueId;

},{"lodash._root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.uniqueid/node_modules/lodash._root/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.uniqueid/node_modules/lodash._root/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.escape/node_modules/lodash._root/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.escape/node_modules/lodash._root/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/lodash.escape/node_modules/lodash._root/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/matches-selector/index.js":[function(require,module,exports){
'use strict';

var proto = Element.prototype;
var vendor = proto.matches
  || proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = el.parentNode.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] == el) return true;
  }
  return false;
}
},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.isfunction/index.js":[function(require,module,exports){
/**
 * lodash 3.0.8 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array constructors, and
  // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isFunction;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/index.js":[function(require,module,exports){
/**
 * lodash 3.1.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseGet = require('lodash._baseget'),
    baseSlice = require('lodash._baseslice'),
    toPath = require('lodash._topath'),
    isArray = require('lodash.isarray'),
    isFunction = require('lodash.isfunction');

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  var type = typeof value;
  if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
    return true;
  }
  if (isArray(value)) {
    return false;
  }
  var result = !reIsDeepProp.test(value);
  return result || (object != null && value in toObject(object));
}

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array ? array.length : 0;
  return length ? array[length - 1] : undefined;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * This method is like `_.get` except that if the resolved value is a function
 * it is invoked with the `this` binding of its parent object and its result
 * is returned.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to resolve.
 * @param {*} [defaultValue] The value returned if the resolved value is `undefined`.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c1': 3, 'c2': _.constant(4) } }] };
 *
 * _.result(object, 'a[0].b.c1');
 * // => 3
 *
 * _.result(object, 'a[0].b.c2');
 * // => 4
 *
 * _.result(object, 'a.b.c', 'default');
 * // => 'default'
 *
 * _.result(object, 'a.b.c', _.constant('default'));
 * // => 'default'
 */
function result(object, path, defaultValue) {
  var result = object == null ? undefined : object[path];
  if (result === undefined) {
    if (object != null && !isKey(path, object)) {
      path = toPath(path);
      object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
      result = object == null ? undefined : object[last(path)];
    }
    result = result === undefined ? defaultValue : result;
  }
  return isFunction(result) ? result.call(object) : result;
}

module.exports = result;

},{"lodash._baseget":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/node_modules/lodash._baseget/index.js","lodash._baseslice":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/node_modules/lodash._baseslice/index.js","lodash._topath":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/node_modules/lodash._topath/index.js","lodash.isarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/node_modules/lodash.isarray/index.js","lodash.isfunction":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.isfunction/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/node_modules/lodash._baseget/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/node_modules/lodash._baseget/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/node_modules/lodash._baseget/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/node_modules/lodash._baseget/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/node_modules/lodash._baseslice/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/node_modules/lodash._baseslice/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/node_modules/lodash._baseslice/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/node_modules/lodash._baseslice/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/node_modules/lodash._topath/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/node_modules/lodash._topath/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/node_modules/lodash._topath/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash._invokepath/node_modules/lodash._topath/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/node_modules/lodash.isarray/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash.isarray/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash.isarray/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/lodash.invoke/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.set/index.js":[function(require,module,exports){
/**
 * lodash 3.7.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var toPath = require('lodash._topath'),
    isArray = require('lodash.isarray');

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/**
 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  var type = typeof value;
  if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
    return true;
  }
  if (isArray(value)) {
    return false;
  }
  var result = !reIsDeepProp.test(value);
  return result || (object != null && value in toObject(object));
}

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Sets the property value of `path` on `object`. If a portion of `path`
 * does not exist it is created.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to augment.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.set(object, 'a[0].b.c', 4);
 * console.log(object.a[0].b.c);
 * // => 4
 *
 * _.set(object, 'x[0].y.z', 5);
 * console.log(object.x[0].y.z);
 * // => 5
 */
function set(object, path, value) {
  if (object == null) {
    return object;
  }
  var pathKey = (path + '');
  path = (object[pathKey] != null || isKey(path, object)) ? [pathKey] : toPath(path);

  var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;

  while (nested != null && ++index < length) {
    var key = path[index];
    if (isObject(nested)) {
      if (index == lastIndex) {
        nested[key] = value;
      } else if (nested[key] == null) {
        nested[key] = isIndex(path[index + 1]) ? [] : {};
      }
    }
    nested = nested[key];
  }
  return object;
}

module.exports = set;

},{"lodash._topath":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.set/node_modules/lodash._topath/index.js","lodash.isarray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.set/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.set/node_modules/lodash._topath/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/node_modules/lodash._topath/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/node_modules/lodash._topath/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/node_modules/lodash._topath/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.set/node_modules/lodash.isarray/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/node_modules/lodash.isarray/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/node_modules/lodash.isarray/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/lodash.result/node_modules/lodash.isarray/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/ampersand-input-view.js":[function(require,module,exports){
;if (typeof window !== "undefined") {  window.ampersand = window.ampersand || {};  window.ampersand["ampersand-input-view"] = window.ampersand["ampersand-input-view"] || [];  window.ampersand["ampersand-input-view"].push("7.0.0");}
var View = require('ampersand-view');
var dom = require('ampersand-dom');
var matchesSelector = require('matches-selector');

var slice = Array.prototype.slice;

function getMatches(el, selector) {
    if (selector === '') return [el];
    var matches = [];
    if (matchesSelector(el, selector)) matches.push(el);
    return matches.concat(slice.call(el.querySelectorAll(selector)));
}

module.exports = View.extend({
    template: [
        '<label>',
            '<span data-hook="label"></span>',
            '<input class="form-input">',
            '<div data-hook="message-container" class="message message-below message-error">',
                '<p data-hook="message-text"></p>',
            '</div>',
        '</label>'
    ].join(''),
    bindings: {
        'name': {
            type: 'attribute',
            selector: 'input, textarea',
            name: 'name'
        },
        'tabindex': {
            type: 'attribute',
            selector: 'input, textarea',
            name: 'tabindex'
        },
        'label': [
            {
                hook: 'label'
            },
            {
                type: 'toggle',
                hook: 'label'
            }
        ],
        'message': {
            type: 'text',
            hook: 'message-text'
        },
        'showMessage': {
            type: 'toggle',
            hook: 'message-container'
        },
        'placeholder': {
            type: 'attribute',
            selector: 'input, textarea',
            name: 'placeholder'
        },
        'readonly': {
            type: 'booleanAttribute',
            name: 'readonly',
            selector: 'input, textarea'
        },
        'autofocus': {
            type: 'booleanAttribute',
            name: 'autofocus',
            selector: 'input, textarea'
        }
    },
    initialize: function (spec) {
        spec || (spec = {});
        this.tests = this.tests || spec.tests || [];
        this.on('change:type', this.handleTypeChange, this);
        this.handleChange = this.handleChange.bind(this);
        this.handleInputChanged = this.handleInputChanged.bind(this);
        var value = !spec.value && spec.value !== 0 ? '' : spec.value;
        this.startingValue = value;
        this.inputValue = value;
        this.on('change:valid change:value', this.reportToParent, this);
        this.on('change:validityClass', this.validityClassChanged, this);
        if (spec.autoRender) this.autoRender = spec.autoRender;
        if (spec.template) this.template = spec.template;
        if (spec.beforeSubmit) this.beforeSubmit = spec.beforeSubmit;
    },
    render: function () {
        this.renderWithTemplate();
        this.input = this.query('input') || this.query('textarea');
        // switches out input for textarea if that's what we want
        this.handleTypeChange();
        this.initInputBindings();
        // Skip validation on initial setValue
        // if the field is not required
        this.setValue(this.inputValue, !this.required);
        return this;
    },
    props: {
        inputValue: 'any',
        startingValue: 'any',
        name: 'string',
        type: ['string', true, 'text'],
        placeholder: ['string', true, ''],
        label: ['string', true, ''],
        required: ['boolean', true, true],
        directlyEdited: ['boolean', true, false],
        readonly: ['boolean', true, false],
        autofocus: ['boolean', true, false],
        shouldValidate: ['boolean', true, false],
        message: ['string', true, ''],
        requiredMessage: ['string', true, 'This field is required.'],
        validClass: ['string', true, 'input-valid'],
        invalidClass: ['string', true, 'input-invalid'],
        validityClassSelector: ['string', true, 'input, textarea'],
        tabindex: ['number', true, 0]
    },
    derived: {
        value: {
            deps: ['inputValue'],
            fn: function () {
                return this.inputValue;
            }
        },
        valid: {
            cache: false,
            deps: ['inputValue'],
            fn: function () {
                return !this.runTests();
            }
        },
        showMessage: {
            deps: ['message', 'shouldValidate'],
            fn: function () {
                return this.shouldValidate && this.message;
            }
        },
        changed: {
            deps: ['inputValue', 'startingValue'],
            fn: function () {
                return this.inputValue !== this.startingValue;
            }
        },
        validityClass: {
            deps: ['valid', 'validClass', 'invalidClass', 'shouldValidate'],
            fn: function () {
                if (!this.shouldValidate) {
                    return '';
                } else {
                    return this.valid ? this.validClass : this.invalidClass;
                }
            }
        }
    },
    setValue: function (value, skipValidation) {
        if (!this.input) {
            this.inputValue = value;
            return;
        }
        if (!value && value !== 0) {
            this.input.value = '';
        } else {
            this.input.value = value.toString();
        }
        this.inputValue = this.clean(this.input.value);
        if (!skipValidation && !this.getErrorMessage()) {
            this.shouldValidate = true;
        } else if (skipValidation) {
            this.shouldValidate = false;
        }
    },
    getErrorMessage: function () {
        var message = '';
        if (this.required && this.value === '') {
            return this.requiredMessage;
        } else {
            (this.tests || []).some(function (test) {
                message = test.call(this, this.value) || '';
                return message;
            }, this);
            return message;
        }
    },
    handleTypeChange: function () {
        if (this.type === 'textarea' && this.input.tagName.toLowerCase() !== 'textarea') {
            var parent = this.input.parentNode;
            var textarea = document.createElement('textarea');
            parent.replaceChild(textarea, this.input);
            this.input = textarea;
            this._applyBindingsForKey('');
        } else {
            this.input.type = this.type;
        }
    },
    clean: function (val) {
        return (this.type === 'number') ? Number(val) : val.trim();
    },
    //`input` event handler
    handleInputChanged: function () {
        if (document.activeElement === this.input) {
            this.directlyEdited = true;
        }
        this.inputValue = this.clean(this.input.value);
    },
    //`change` event handler
    handleChange: function () {
        if (this.inputValue && this.changed) {
            this.shouldValidate = true;
        }
        this.runTests();
    },
    beforeSubmit: function () {
        // catch undetected input changes that were not caught due to lack of
        // browser event firing see:
        // https://github.com/AmpersandJS/ampersand-input-view/issues/2
        this.inputValue = this.clean(this.input.value);

        // at the point where we've tried
        // to submit, we want to validate
        // everything from now on.
        this.shouldValidate = true;
        this.runTests();
    },
    runTests: function () {
        var message = this.getErrorMessage();
        if (!message && this.inputValue && this.changed) {
            // if it's ever been valid,
            // we want to validate from now
            // on.
            this.shouldValidate = true;
        }
        this.message = message;
        return message;
    },
    initInputBindings: function () {
        this.input.addEventListener('input', this.handleInputChanged, false);
        this.input.addEventListener('change', this.handleChange,false);
    },
    remove: function () {
        this.input.removeEventListener('input', this.handleInputChanged, false);
        this.input.removeEventListener('change', this.handleChange, false);
        View.prototype.remove.apply(this, arguments);
    },
    reset: function () {
        this.setValue(this.startingValue, true); //Skip validation just like on initial render
    },
    clear: function () {
        this.setValue('', true);
    },
    validityClassChanged: function (view, newClass) {
        var oldClass = view.previousAttributes().validityClass;
        getMatches(this.el, this.validityClassSelector).forEach(function (match) {
            dom.switchClass(match, oldClass, newClass);
        });
    },
    reportToParent: function () {
        if (this.parent) this.parent.update(this);
    }
});

},{"ampersand-dom":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-dom/ampersand-dom.js","ampersand-view":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/ampersand-view.js","matches-selector":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/matches-selector/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-dom/ampersand-dom.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/ampersand-dom/ampersand-dom.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/ampersand-dom/ampersand-dom.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/node_modules/ampersand-dom/ampersand-dom.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/ampersand-view.js":[function(require,module,exports){
;if (typeof window !== "undefined") {  window.ampersand = window.ampersand || {};  window.ampersand["ampersand-view"] = window.ampersand["ampersand-view"] || [];  window.ampersand["ampersand-view"].push("10.0.1");}
var State = require('ampersand-state');
var CollectionView = require('ampersand-collection-view');
var domify = require('domify');
var uniqueId = require("lodash/uniqueId");
var pick = require("lodash/pick");
var assign = require("lodash/assign");
var forEach = require("lodash/forEach");
var result = require("lodash/result");
var last = require("lodash/last");
var isString = require("lodash/isString");
var bind = require("lodash/bind");
var flatten = require("lodash/flatten");
var invokeMap = require("lodash/invokeMap");
var events = require('events-mixin');
var matches = require('matches-selector');
var bindings = require('ampersand-dom-bindings');
var getPath = require('lodash/get');

function View(attrs) {
    this.cid = uniqueId('view');
    attrs || (attrs = {});
    var parent = attrs.parent;
    delete attrs.parent;
    BaseState.call(this, attrs, {init: false, parent: parent});
    this.on('change:el', this._handleElementChange, this);
    this._upsertBindings();
    this.template = attrs.template || this.template;
    this._cache.rendered = false; // prep `rendered` derived cache immediately
    this.initialize.apply(this, arguments);
    if (this.autoRender && this.template) {
        this.render();
    }
}

var BaseState = State.extend({
    dataTypes: {
        element: {
            set: function (newVal) {
                return {
                    val: newVal,
                    type: newVal instanceof Element ? 'element' : typeof newVal
                };
            },
            compare: function (el1, el2) {
                return el1 === el2;
            }
        },
        collection: {
            set: function (newVal) {
                return {
                    val: newVal,
                    type: newVal && newVal.isCollection ? 'collection' : typeof newVal
                };
            },
            compare: function (currentVal, newVal) {
                return currentVal === newVal;
            }
        }
    },
    props: {
        model: 'state',
        el: 'element',
        collection: 'collection',
    },
    session: {
        _rendered: ['boolean', true, false]
    },
    derived: {
        hasData: {
            deps: ['model'],
            fn: function () {
                return !!this.model;
            }
        },
        rendered: {
            deps: ['_rendered'],
            fn: function() {
                if (this._rendered) {
                    this.trigger('render', this);
                    return true;
                }
                this.trigger('remove', this);
                return false;
            }
        }
    }
});

// Cached regex to split keys for `delegate`.
var delegateEventSplitter = /^(\S+)\s*(.*)$/;

View.prototype = Object.create(BaseState.prototype);

var queryNoElMsg = 'Query cannot be performed as this.el is not defined. Ensure that the view has been rendered.';

// Set up all inheritable properties and methods.
assign(View.prototype, {
    // ## query
    // Get an single element based on CSS selector scoped to this.el
    // if you pass an empty string it return `this.el`.
    // If you pass an element we just return it back.
    // This lets us use `get` to handle cases where users
    // can pass a selector or an already selected element.
    query: function (selector) {
        if (!this.el) {
            throw new Error(queryNoElMsg);
        }
        if (!selector) return this.el;
        if (typeof selector === 'string') {
            if (matches(this.el, selector)) return this.el;
            return this.el.querySelector(selector) || undefined;
        }
        return selector;
    },

    // ## queryAll
    // Returns an array of elements based on CSS selector scoped to this.el
    // if you pass an empty string it return `this.el`. Also includes root
    // element.
    queryAll: function (selector) {
        if (!this.el) {
            throw new Error(queryNoElMsg);
        }
        if (!selector) return [this.el];
        var res = [];
        if (matches(this.el, selector)) res.push(this.el);
        return res.concat(Array.prototype.slice.call(this.el.querySelectorAll(selector)));
    },

    // ## queryByHook
    // Convenience method for fetching element by it's `data-hook` attribute.
    // Also tries to match against root element.
    // Also supports matching 'one' of several space separated hooks.
    queryByHook: function (hook) {
        return this.query('[data-hook~="' + hook + '"]');
    },

    // ## queryAllByHook
    // Convenience method for fetching all elements by their's `data-hook` attribute.
    queryAllByHook: function (hook) {
        return this.queryAll('[data-hook~="' + hook + '"]');
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function () {},

    // **render** is the core function that your view can override. Its job is
    // to populate its element (`this.el`), with the appropriate HTML.
    _render: function () {
        this._upsertBindings();
        this.renderWithTemplate(this);
        this._rendered = true;
        return this;
    },

    // Removes this view by taking the element out of the DOM, and removing any
    // applicable events listeners.
    _remove: function () {
        if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
        this._rendered = false;
        this._downsertBindings();
        return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    _handleElementChange: function (element, delegate) {
        if (this.eventManager) this.eventManager.unbind();
        this.eventManager = events(this.el, this);
        this.delegateEvents();
        this._applyBindingsForKey();
        return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function (e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function (events) {
        if (!(events || (events = result(this, 'events')))) return this;
        this.undelegateEvents();
        for (var key in events) {
            this.eventManager.bind(key, events[key]);
        }
        return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function () {
        this.eventManager.unbind();
        return this;
    },

    // ## registerSubview
    // Pass it a view. This can be anything with a `remove` method
    registerSubview: function (view) {
        // Storage for our subviews.
        this._subviews = this._subviews || [];
        this._subviews.push(view);
        // set the parent reference if it has not been set
        if (!view.parent) view.parent = this;
        return view;
    },

    // ## renderSubview
    // Pass it a view instance and a container element
    // to render it in. It's `remove` method will be called
    // when the parent view is destroyed.
    renderSubview: function (view, container) {
        if (typeof container === 'string') {
            container = this.query(container);
        }
        if (!container) container = this.el;
        this.registerSubview(view);
        container.appendChild(view.render().el);
        return view;
    },

    _applyBindingsForKey: function (name) {
        if (!this.el) return;
        var fns = this._parsedBindings.getGrouped(name);
        var item;
        for (item in fns) {
            fns[item].forEach(function (fn) {
                fn(this.el, getPath(this, item), last(item.split('.')));
            }, this);
        }
    },

    _initializeBindings: function () {
        if (!this.bindings) return;
        this.on('all', function (eventName) {
            if (eventName.slice(0, 7) === 'change:') {
                this._applyBindingsForKey(eventName.split(':')[1]);
            }
        }, this);
    },

    // ## _initializeSubviews
    // this is called at setup and grabs declared subviews
    _initializeSubviews: function () {
        if (!this.subviews) return;
        for (var item in this.subviews) {
            this._parseSubview(this.subviews[item], item);
        }
    },

    // ## _parseSubview
    // helper for parsing out the subview declaration and registering
    // the `waitFor` if need be.
    _parseSubview: function (subview, name) {
        //backwards compatibility with older versions, when `container` was a valid property (#114)
        if (subview.container) {
            subview.selector = subview.container;
        }
        var opts = this._parseSubviewOpts(subview);

        function action() {
            var el, subview;
            // if not rendered or we can't find our element, stop here.
            if (!this.el || !(el = this.query(opts.selector))) return;
            if (!opts.waitFor || getPath(this, opts.waitFor)) {
                subview = this[name] = opts.prepareView.call(this, el);
                if (!subview.el) {
                    this.renderSubview(subview, el);
                } else {
                    subview.render();
                    this.registerSubview(subview);
                }
                this.off('change', action);
            }
        }
        // we listen for main `change` items
        this.on('change', action, this);
    },

    // Parses the declarative subview definition.
    // You may overload this method to create your own declarative subview style.
    // You must return an object with members 'selector', 'waitFor' and 'prepareView'.
    // waitFor is trigged on the view 'change' event and so one way to extend the deferred view
    // construction is to add an additional property (props) to the view. Then setting this property
    // will satisfy the waitFor condition. You can then extend the prepareView function to pass in
    // additional data from the parent view. This can allow you to have multi-stage rendering of
    // custom data formats and to declaratively define.
    _parseSubviewOpts: function (subview) {
        var self = this;
        var opts = {
            selector: subview.selector || '[data-hook="' + subview.hook + '"]',
            waitFor: subview.waitFor || '',
            prepareView: subview.prepareView || function () {
                return new subview.constructor({
                    parent: self
                });
            }
        };
        return opts;
    },

    // Shortcut for doing everything we need to do to
    // render and fully replace current root element.
    // Either define a `template` property of your view
    // or pass in a template directly.
    // The template can either be a string or a function.
    // If it's a function it will be passed the `context`
    // argument.
    renderWithTemplate: function (context, templateArg) {
        var template = templateArg || this.template;
        if (!template) throw new Error('Template string or function needed.');
        var newDom = isString(template) ? template : template.call(this, context || this);
        if (isString(newDom)) newDom = domify(newDom);
        var parent = this.el && this.el.parentNode;
        if (parent) parent.replaceChild(newDom, this.el);
        if (newDom.nodeName === '#document-fragment') throw new Error('Views can only have one root element, including comment nodes.');
        this.el = newDom;
        return this;
    },

    // ## cacheElements
    // This is a shortcut for adding reference to specific elements within your view for
    // access later. This avoids excessive DOM queries and makes it easier to update
    // your view if your template changes.
    //
    // In your `render` method. Use it like so:
    //
    //     render: function () {
    //       this.basicRender();
    //       this.cacheElements({
    //         pages: '#pages',
    //         chat: '#teamChat',
    //         nav: 'nav#views ul',
    //         me: '#me',
    //         cheatSheet: '#cheatSheet',
    //         omniBox: '#awesomeSauce'
    //       });
    //     }
    //
    // Then later you can access elements by reference like so: `this.pages`, or `this.chat`.
    cacheElements: function (hash) {
        for (var item in hash) {
            this[item] = this.query(hash[item]);
        }
        return this;
    },

    // ## listenToAndRun
    // Shortcut for registering a listener for a model
    // and also triggering it right away.
    listenToAndRun: function (object, events, handler) {
        var bound = bind(handler, this);
        this.listenTo(object, events, bound);
        bound();
    },

    // ## animateRemove
    // Placeholder for if you want to do something special when they're removed.
    // For example fade it out, etc.
    // Any override here should call `.remove()` when done.
    animateRemove: function () {
        this.remove();
    },

    // ## renderCollection
    // Method for rendering a collections with individual views.
    // Just pass it the collection, and the view to use for the items in the
    // collection. The collectionView is returned.
    renderCollection: function (collection, ViewClass, container, opts) {
        var containerEl = (typeof container === 'string') ? this.query(container) : container;
        var config = assign({
            collection: collection,
            el: containerEl || this.el,
            view: ViewClass,
            parent: this,
            viewOptions: {
                parent: this
            }
        }, opts);
        var collectionView = new CollectionView(config);
        collectionView.render();
        return this.registerSubview(collectionView);
    },

    _setRender: function(obj) {
        Object.defineProperty(obj, 'render', {
            get: function() {
                return this._render;
            },
            set: function(fn) {
                this._render = function() {
                    fn.apply(this, arguments);
                    this._rendered = true;
                    return this;
                };
            }
        });
    },

    _setRemove: function(obj) {
        Object.defineProperty(obj, 'remove', {
            get: function() {
                return this._remove;
            },
            set: function(fn) {
                this._remove = function() {
                    fn.apply(this, arguments);
                    this._rendered = false;
                    return this;
                };
            }
        });
    },

    _downsertBindings: function() {
        var parsedBindings = this._parsedBindings;
        if (!this.bindingsSet) return;
        if (this._subviews) invokeMap(flatten(this._subviews), 'remove');
        this.stopListening();
        // TODO: Not sure if this is actually necessary.
        // Just trying to de-reference this potentially large
        // amount of generated functions to avoid memory leaks.
        forEach(parsedBindings, function (properties, modelName) {
            forEach(properties, function (value, key) {
                delete parsedBindings[modelName][key];
            });
            delete parsedBindings[modelName];
        });
        this.bindingsSet = false;
    },

    _upsertBindings: function(attrs) {
        attrs = attrs || this;
        if (this.bindingsSet) return;
        this._parsedBindings = bindings(this.bindings, this);
        this._initializeBindings();
        if (attrs.el && !this.autoRender) {
            this._handleElementChange();
        }
        this._initializeSubviews();
        this.bindingsSet = true;
    }
});

View.prototype._setRender(View.prototype);
View.prototype._setRemove(View.prototype);
View.extend = BaseState.extend;
module.exports = View;

},{"ampersand-collection-view":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/ampersand-collection-view.js","ampersand-dom-bindings":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/ampersand-dom-bindings.js","ampersand-state":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-state/ampersand-state.js","domify":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/domify/index.js","events-mixin":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/events-mixin/index.js","lodash/assign":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/assign.js","lodash/bind":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/bind.js","lodash/flatten":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/flatten.js","lodash/forEach":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/forEach.js","lodash/get":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/get.js","lodash/invokeMap":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/invokeMap.js","lodash/isString":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isString.js","lodash/last":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/last.js","lodash/pick":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/pick.js","lodash/result":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/result.js","lodash/uniqueId":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/uniqueId.js","matches-selector":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/matches-selector/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/ampersand-collection-view.js":[function(require,module,exports){
;if (typeof window !== "undefined") {  window.ampersand = window.ampersand || {};  window.ampersand["ampersand-collection-view"] = window.ampersand["ampersand-collection-view"] || [];  window.ampersand["ampersand-collection-view"].push("2.0.1");}
var assign = require('lodash/assign');
var invokeMap = require('lodash/invokeMap');
var pick = require('lodash/pick');
var find = require('lodash/find');
var difference = require('lodash/difference');
var bind = require('lodash/bind');
var Events = require('ampersand-events');
var ampExtend = require('ampersand-class-extend');

// options
var options = ['collection', 'el', 'viewOptions', 'view', 'emptyView', 'filter', 'reverse', 'parent'];


function CollectionView(spec) {
    if (!spec) {
        throw new ReferenceError('Collection view missing required parameters: collection, el');
    }
    if (!spec.collection) {
        throw new ReferenceError('Collection view requires a collection');
    }
    if (!spec.el && !this.insertSelf) {
        throw new ReferenceError('Collection view requires an el');
    }
    assign(this, pick(spec, options));
    this.views = [];
    this.listenTo(this.collection, 'add', this._addViewForModel);
    this.listenTo(this.collection, 'remove', this._removeViewForModel);
    this.listenTo(this.collection, 'sort', this._rerenderAll);
    this.listenTo(this.collection, 'refresh reset', this._reset);
}

assign(CollectionView.prototype, Events, {
    // for view contract compliance
    render: function () {
        this._renderAll();
        return this;
    },
    remove: function () {
        invokeMap(this.views, 'remove');
        this.stopListening();
    },
    _getViewByModel: function (model) {
        return find(this.views, function (view) {
            return model === view.model;
        });
    },
    _createViewForModel: function (model, renderOpts) {
        var defaultViewOptions = {model: model, collection: this.collection, parent: this};
        var view = new this.view(assign(defaultViewOptions, this.viewOptions));
        this.views.push(view);
        view.renderedByParentView = true;
        view.render(renderOpts);
        return view;
    },
    _getOrCreateByModel: function (model, renderOpts) {
        return this._getViewByModel(model) || this._createViewForModel(model, renderOpts);
    },
    _addViewForModel: function (model, collection, options) {
        var matches = this.filter ? this.filter(model) : true;
        if (!matches) {
            return;
        }
        if (this.renderedEmptyView) {
            this.renderedEmptyView.remove();
            delete this.renderedEmptyView;
        }
        var view = this._getOrCreateByModel(model, {containerEl: this.el});
        if (options && options.rerender) {
            this._insertView(view);
        } else {
            this._insertViewAtIndex(view);
        }
    },
    _insertViewAtIndex: function (view) {
        if (!view.insertSelf) {
            var pos = this.collection.indexOf(view.model);
            var modelToInsertBefore, viewToInsertBefore;

            if (this.reverse) {
                modelToInsertBefore = this.collection.at(pos - 1);
            } else {
                modelToInsertBefore = this.collection.at(pos + 1);
            }

            viewToInsertBefore = this._getViewByModel(modelToInsertBefore);

            // FIX IE bug (https://developer.mozilla.org/en-US/docs/Web/API/Node.insertBefore)
            // "In Internet Explorer an undefined value as referenceElement will throw errors, while in rest of the modern browsers, this works fine."
            if(viewToInsertBefore) {
                this.el.insertBefore(view.el, viewToInsertBefore && viewToInsertBefore.el);
            } else {
                this.el.appendChild(view.el);
            }
        }
    },
    _insertView: function (view) {
        if (!view.insertSelf) {
            if (this.reverse && this.el.firstChild) {
                this.el.insertBefore(view.el, this.el.firstChild);
            } else {
                this.el.appendChild(view.el);
            }
        }
    },
    _removeViewForModel: function (model) {
        var view = this._getViewByModel(model);
        if (!view) {
            return;
        }
        var index = this.views.indexOf(view);
        if (index !== -1) {
            // remove it if we found it calling animateRemove
            // to give user option of gracefully destroying.
            view = this.views.splice(index, 1)[0];
            this._removeView(view);
            if (this.views.length === 0) {
                this._renderEmptyView();
            }
        }
    },
    _removeView: function (view) {
        if (view.animateRemove) {
            view.animateRemove();
        } else {
            view.remove();
        }
    },
    _renderAll: function () {
        this.collection.each(bind(this._addViewForModel, this));
        if (this.views.length === 0) {
            this._renderEmptyView();
        }
    },
    _rerenderAll: function (collection, options) {
        options = options || {};
        this.collection.each(bind(function (model) {
            this._addViewForModel(model, this, assign(options, {rerender: true}));
        }, this));
    },
    _renderEmptyView: function() {
        if (this.emptyView && !this.renderedEmptyView) {
            var view = this.renderedEmptyView = new this.emptyView({parent: this});
            this.el.appendChild(view.render().el);
        }
    },
    _reset: function () {
        var newViews = this.collection.map(bind(this._getOrCreateByModel, this));

        //Remove existing views from the ui
        var toRemove = difference(this.views, newViews);
        toRemove.forEach(this._removeView, this);

        //Rerender the full list with the new views
        this.views = newViews;
        this._rerenderAll();
        if (this.views.length === 0) {
            this._renderEmptyView();
        }
    }
});

CollectionView.extend = ampExtend;

module.exports = CollectionView;

},{"ampersand-class-extend":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-class-extend/ampersand-class-extend.js","ampersand-events":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/ampersand-events.js","lodash/assign":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/assign.js","lodash/bind":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/bind.js","lodash/difference":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/difference.js","lodash/find":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/find.js","lodash/invokeMap":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/invokeMap.js","lodash/pick":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/pick.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-class-extend/ampersand-class-extend.js":[function(require,module,exports){
var assign = require('lodash/assign');

/// Following code is largely pasted from Backbone.js

// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
var extend = function(protoProps) {
    var parent = this;
    var child;
    var args = [].slice.call(arguments);

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
    } else {
        child = function () {
            return parent.apply(this, arguments);
        };
    }

    // Add static properties to the constructor function from parent
    assign(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // Mix in all prototype properties to the subclass if supplied.
    if (protoProps) {
        args.unshift(child.prototype);
        assign.apply(null, args);
    }

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
};

// Expose the extend function
module.exports = extend;

},{"lodash/assign":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/assign.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/ampersand-events.js":[function(require,module,exports){
;if (typeof window !== "undefined") {  window.ampersand = window.ampersand || {};  window.ampersand["ampersand-events"] = window.ampersand["ampersand-events"] || [];  window.ampersand["ampersand-events"].push("2.0.2");}
var runOnce = require('lodash/once');
var keys = require('lodash/keys');
var isEmpty = require('lodash/isEmpty');
var assign = require('lodash/assign');
var forEach = require('lodash/forEach');
var slice = Array.prototype.slice;

var utils = require('./libs/utils');

var Events = {
    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function (name, callback, context) {
        if (!utils.eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
        this._events || (this._events = {});
        var events = this._events[name] || (this._events[name] = []);
        events.push({callback: callback, context: context, ctx: context || this});
        return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function (name, callback, context) {
        if (!utils.eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
        var self = this;
        var once = runOnce(function () {
            self.off(name, once);
            callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function (name, callback, context) {
        var retain, ev, events, names, i, l, j, k;
        if (!this._events || !utils.eventsApi(this, 'off', name, [callback, context])) return this;
        if (!name && !callback && !context) {
            this._events = void 0;
            return this;
        }
        names = name ? [name] : keys(this._events);
        for (i = 0, l = names.length; i < l; i++) {
            name = names[i];
            if (events = this._events[name]) {
                this._events[name] = retain = [];
                if (callback || context) {
                    for (j = 0, k = events.length; j < k; j++) {
                        ev = events[j];
                        if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                                (context && context !== ev.context)) {
                            retain.push(ev);
                        }
                    }
                }
                if (!retain.length) delete this._events[name];
            }
        }

        return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function (name) {
        if (!this._events) return this;
        var args = slice.call(arguments, 1);
        if (!utils.eventsApi(this, 'trigger', name, args)) return this;
        var events = this._events[name];
        var allEvents = this._events.all;
        if (events) utils.triggerEvents(events, args);
        if (allEvents) utils.triggerEvents(allEvents, arguments);
        return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function (obj, name, callback) {
        var listeningTo = this._listeningTo;
        if (!listeningTo) return this;
        var remove = !name && !callback;
        if (!callback && typeof name === 'object') callback = this;
        if (obj) (listeningTo = {})[obj._listenId] = obj;
        var self = this;
        forEach(listeningTo, function (item, id) {
            item.off(name, callback, self);
            if (remove || isEmpty(item._events)) delete self._listeningTo[id];
        });
        return this;
    },

    // extend an object with event capabilities if passed
    // or just return a new one.
    createEmitter: function (obj) {
        return assign(obj || {}, Events);
    },

    listenTo: utils.createListenMethod('on'),

    listenToOnce: utils.createListenMethod('once'),

    listenToAndRun: function (obj, name, callback) {
        this.listenTo.apply(this, arguments);
        if (!callback && typeof name === 'object') callback = this;
        callback.apply(this);
        return this;
    }
};

// setup aliases
Events.bind = Events.on;
Events.unbind = Events.off;
Events.removeListener = Events.off;
Events.removeAllListeners = Events.off;
Events.emit = Events.trigger;

module.exports = Events;

},{"./libs/utils":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/libs/utils.js","lodash/assign":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/assign.js","lodash/forEach":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/forEach.js","lodash/isEmpty":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isEmpty.js","lodash/keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/keys.js","lodash/once":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/once.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/libs/utils.js":[function(require,module,exports){
var uniqueId = require('lodash/uniqueId');
var eventSplitter = /\s+/;

// A difficult-to-believe, but optimized internal dispatch function for
// triggering events. Tries to keep the usual cases speedy.
exports.triggerEvents = function triggerEvents(events, args) {
    var ev;
    var i = -1;
    var l = events.length;
    var a1 = args[0];
    var a2 = args[1];
    var a3 = args[2];
    switch (args.length) {
        case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
        case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
        case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
        case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
        default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
};

// Implement fancy features of the Events API such as multiple event
// names `"change blur"` and jQuery-style event maps `{change: action}`
// in terms of the existing API.
exports.eventsApi = function eventsApi(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
        for (var key in name) {
            obj[action].apply(obj, [key, name[key]].concat(rest));
        }
        return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
        var names = name.split(eventSplitter);
        for (var i = 0, l = names.length; i < l; i++) {
            obj[action].apply(obj, [names[i]].concat(rest));
        }
        return false;
    }

    return true;
};

// Inversion-of-control versions of `on` and `once`. Tell *this* object to
// listen to an event in another object ... keeping track of what it's
// listening to.
exports.createListenMethod = function createListenMethod(implementation) {
    return function listenMethod(obj, name, callback) {
        if (!obj) {
            throw new Error('Trying to listenTo event: \'' + name + '\' but the target object is undefined');
        }
        var listeningTo = this._listeningTo || (this._listeningTo = {});
        var id = obj._listenId || (obj._listenId = uniqueId('l'));
        listeningTo[id] = obj;
        if (!callback && typeof name === 'object') callback = this;
        if (typeof obj[implementation] !== 'function') {
            throw new Error('Trying to listenTo event: \'' + name + '\' on object: ' + obj.toString() + ' but it does not have an \'on\' method so is unbindable');
        }
        obj[implementation](name, callback, this);
        return this;
    };
};

},{"lodash/uniqueId":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/uniqueId.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/ampersand-dom-bindings.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/ampersand-dom-bindings.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/ampersand-dom-bindings.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-dom-bindings/ampersand-dom-bindings.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-state/ampersand-state.js":[function(require,module,exports){
'use strict';
;if (typeof window !== "undefined") {  window.ampersand = window.ampersand || {};  window.ampersand["ampersand-state"] = window.ampersand["ampersand-state"] || [];  window.ampersand["ampersand-state"].push("5.0.2");}
var uniqueId = require('lodash/uniqueId');
var assign = require('lodash/assign');
var cloneObj = function(obj) { return assign({}, obj); };
var omit = require('lodash/omit');
var escape = require('lodash/escape');
var forOwn = require('lodash/forOwn');
var includes = require('lodash/includes');
var isString = require('lodash/isString');
var isObject = require('lodash/isObject');
var isDate = require('lodash/isDate');
var isFunction = require('lodash/isFunction');
var _isEqual = require('lodash/isEqual'); // to avoid shadowing
var has = require('lodash/has');
var result = require('lodash/result');
var bind = require('lodash/bind'); // because phantomjs doesn't have Function#bind
var union = require('lodash/union');
var Events = require('ampersand-events');
var KeyTree = require('key-tree-store');
var arrayNext = require('array-next');
var changeRE = /^change:/;
var noop = function () {};

function Base(attrs, options) {
    options || (options = {});
    this.cid || (this.cid = uniqueId('state'));
    this._events = {};
    this._values = {};
    this._eventBubblingHandlerCache = {};
    this._definition = Object.create(this._definition);
    if (options.parse) attrs = this.parse(attrs, options);
    this.parent = options.parent;
    this.collection = options.collection;
    this._keyTree = new KeyTree();
    this._initCollections();
    this._initChildren();
    this._cache = {};
    this._previousAttributes = {};
    if (attrs) this.set(attrs, assign({silent: true, initial: true}, options));
    this._changed = {};
    if (this._derived) this._initDerived();
    if (options.init !== false) this.initialize.apply(this, arguments);
}

assign(Base.prototype, Events, {
    // can be allow, ignore, reject
    extraProperties: 'ignore',

    idAttribute: 'id',

    namespaceAttribute: 'namespace',

    typeAttribute: 'modelType',

    // Stubbed out to be overwritten
    initialize: function () {
        return this;
    },

    // Get ID of model per configuration.
    // Should *always* be how ID is determined by other code.
    getId: function () {
        return this[this.idAttribute];
    },

    // Get namespace of model per configuration.
    // Should *always* be how namespace is determined by other code.
    getNamespace: function () {
        return this[this.namespaceAttribute];
    },

    // Get type of model per configuration.
    // Should *always* be how type is determined by other code.
    getType: function () {
        return this[this.typeAttribute];
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function () {
        return this.getId() == null;
    },

    // get HTML-escaped value of attribute
    escape: function (attr) {
        return escape(this.get(attr));
    },

    // Check if the model is currently in a valid state.
    isValid: function (options) {
        return this._validate({}, assign(options || {}, { validate: true }));
    },

    // Parse can be used remap/restructure/rename incoming properties
    // before they are applied to attributes.
    parse: function (resp, options) {
        //jshint unused:false
        return resp;
    },

    // Serialize is the inverse of `parse` it lets you massage data
    // on the way out. Before, sending to server, for example.
    serialize: function (options) {
        var attrOpts = assign({props: true}, options);
        var res = this.getAttributes(attrOpts, true);
        forOwn(this._children, bind(function (value, key) {
            res[key] = this[key].serialize();
        }, this));
        forOwn(this._collections, bind(function (value, key) {
            res[key] = this[key].serialize();
        }, this));
        return res;
    },

    // Main set method used by generated setters/getters and can
    // be used directly if you need to pass options or set multiple
    // properties at once.
    set: function (key, value, options) {
        var self = this;
        var extraProperties = this.extraProperties;
        var wasChanging, changeEvents, newType, newVal, def, cast, err, attr,
            attrs, dataType, silent, unset, currentVal, initial, hasChanged, isEqual, onChange;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (isObject(key) || key === null) {
            attrs = key;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }

        options = options || {};

        if (!this._validate(attrs, options)) return false;

        // Extract attributes and options.
        unset = options.unset;
        silent = options.silent;
        initial = options.initial;

        // Initialize change tracking.
        wasChanging = this._changing;
        this._changing = true;
        changeEvents = [];

        // if not already changing, store previous
        if (initial) {
            this._previousAttributes = {};
        } else if (!wasChanging) {
            this._previousAttributes = this.attributes;
            this._changed = {};
        }

        // For each `set` attribute...
        for (var i = 0, keys = Object.keys(attrs), len = keys.length; i < len; i++) {
            attr = keys[i];
            newVal = attrs[attr];
            newType = typeof newVal;
            currentVal = this._values[attr];
            def = this._definition[attr];

            if (!def) {
                // if this is a child model or collection
                if (this._children[attr] || this._collections[attr]) {
                    if (!isObject(newVal)) {
                        newVal = {};
                    }

                    this[attr].set(newVal, options);
                    continue;
                } else if (extraProperties === 'ignore') {
                    continue;
                } else if (extraProperties === 'reject') {
                    throw new TypeError('No "' + attr + '" property defined on ' + (this.type || 'this') + ' model and extraProperties not set to "ignore" or "allow"');
                } else if (extraProperties === 'allow') {
                    def = this._createPropertyDefinition(attr, 'any');
                } else if (extraProperties) {
                    throw new TypeError('Invalid value for extraProperties: "' + extraProperties + '"');
                }
            }

            isEqual = this._getCompareForType(def.type);
            onChange = this._getOnChangeForType(def.type);
            dataType = this._dataTypes[def.type];

            // check type if we have one
            if (dataType && dataType.set) {
                cast = dataType.set(newVal);
                newVal = cast.val;
                newType = cast.type;
            }

            // If we've defined a test, run it
            if (def.test) {
                err = def.test.call(this, newVal, newType);
                if (err) {
                    throw new TypeError('Property \'' + attr + '\' failed validation with error: ' + err);
                }
            }

            // If we are required but undefined, throw error.
            // If we are null and are not allowing null, throw error
            // If we have a defined type and the new type doesn't match, and we are not null, throw error.
            // If we require specific value and new one is not one of them, throw error (unless it has default value or we're unsetting it with undefined).

            if (newVal === undefined && def.required) {
                throw new TypeError('Required property \'' + attr + '\' must be of type ' + def.type + '. Tried to set ' + newVal);
            }
            if (newVal === null && def.required && !def.allowNull) {
                throw new TypeError('Property \'' + attr + '\' must be of type ' + def.type + ' (cannot be null). Tried to set ' + newVal);
            }
            if ((def.type && def.type !== 'any' && def.type !== newType) && newVal !== null && newVal !== undefined) {
                throw new TypeError('Property \'' + attr + '\' must be of type ' + def.type + '. Tried to set ' + newVal);
            }
            if (def.values && !includes(def.values, newVal)) {
                var defaultValue = result(def, 'default');
                if (unset && defaultValue !== undefined) {
                    newVal = defaultValue;
                } else if (!unset || (unset && newVal !== undefined)) {
                    throw new TypeError('Property \'' + attr + '\' must be one of values: ' + def.values.join(', ') + '. Tried to set ' + newVal);
                }
            }

            // We know this has 'changed' if it's the initial set, so skip a potentially expensive isEqual check.
            hasChanged = initial || !isEqual(currentVal, newVal, attr);

            // enforce `setOnce` for properties if set
            if (def.setOnce && currentVal !== undefined && hasChanged) {
                throw new TypeError('Property \'' + attr + '\' can only be set once.');
            }

            // set/unset attributes.
            // If this is not the initial set, keep track of changed attributes
            // and push to changeEvents array so we can fire events.
            if (hasChanged) {

                // This fires no matter what, even on initial set.
                onChange(newVal, currentVal, attr);

                // If this is a change (not an initial set), mark the change.
                // Note it's impossible to unset on the initial set (it will already be unset),
                // so we only include that logic here.
                if (!initial) {
                    this._changed[attr] = newVal;
                    this._previousAttributes[attr] = currentVal;
                    if (unset) {
                        // FIXME delete is very slow. Can we get away with setting to undefined?
                        delete this._values[attr];
                    }
                    if (!silent) {
                        changeEvents.push({prev: currentVal, val: newVal, key: attr});
                    }
                }
                if (!unset) {
                    this._values[attr] = newVal;
                }
            } else {
                // Not changed
                // FIXME delete is very slow. Can we get away with setting to undefined?
                delete this._changed[attr];
            }
        }

        // Fire events. This array is not populated if we are told to be silent.
        if (changeEvents.length) this._pending = true;
        changeEvents.forEach(function (change) {
            self.trigger('change:' + change.key, self, change.val, options);
        });

        // You might be wondering why there's a `while` loop here. Changes can
        // be recursively nested within `"change"` events.
        if (wasChanging) return this;
        while (this._pending) {
            this._pending = false;
            this.trigger('change', this, options);
        }
        this._pending = false;
        this._changing = false;
        return this;
    },

    get: function (attr) {
        return this[attr];
    },

    // Toggle boolean properties or properties that have a `values`
    // array in its definition.
    toggle: function (property) {
        var def = this._definition[property];
        if (def.type === 'boolean') {
            // if it's a bool, just flip it
            this[property] = !this[property];
        } else if (def && def.values) {
            // If it's a property with an array of values
            // skip to the next one looping back if at end.
            this[property] = arrayNext(def.values, this[property]);
        } else {
            throw new TypeError('Can only toggle properties that are type `boolean` or have `values` array.');
        }
        return this;
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function () {
        return cloneObj(this._previousAttributes);
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function (attr) {
        if (attr == null) return !!Object.keys(this._changed).length;
        if (has(this._derived, attr)) {
            return this._derived[attr].depList.some(function (dep) {
                return this.hasChanged(dep);
            }, this);
        }
        return has(this._changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function (diff) {
        if (!diff) return this.hasChanged() ? cloneObj(this._changed) : false;
        var val, changed = false;
        var old = this._changing ? this._previousAttributes : this.attributes;
        var def, isEqual;
        for (var attr in diff) {
            def = this._definition[attr];
            if (!def) continue;
            isEqual = this._getCompareForType(def.type);
            if (isEqual(old[attr], (val = diff[attr]))) continue;
            (changed || (changed = {}))[attr] = val;
        }
        return changed;
    },

    toJSON: function () {
        return this.serialize();
    },

    unset: function (attrs, options) {
        var self = this;
        attrs = Array.isArray(attrs) ? attrs : [attrs];
        attrs.forEach(function (key) {
            var def = self._definition[key];
            if (!def) return;
            var val;
            if (def.required) {
                val = result(def, 'default');
                return self.set(key, val, options);
            } else {
                return self.set(key, val, assign({}, options, {unset: true}));
            }
        });
    },

    clear: function (options) {
        var self = this;
        Object.keys(this.attributes).forEach(function (key) {
            self.unset(key, options);
        });
        return this;
    },

    previous: function (attr) {
        if (attr == null || !Object.keys(this._previousAttributes).length) return null;
        return this._previousAttributes[attr];
    },

    // Get default values for a certain type
    _getDefaultForType: function (type) {
        var dataType = this._dataTypes[type];
        return dataType && dataType['default'];
    },

    // Determine which comparison algorithm to use for comparing a property
    _getCompareForType: function (type) {
        var dataType = this._dataTypes[type];
        if (dataType && dataType.compare) return bind(dataType.compare, this);
        return _isEqual; // if no compare function is defined, use _.isEqual
    },

    _getOnChangeForType : function(type){
        var dataType = this._dataTypes[type];
        if (dataType && dataType.onChange) return bind(dataType.onChange, this);
        return noop;
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function (attrs, options) {
        if (!options.validate || !this.validate) return true;
        attrs = assign({}, this.attributes, attrs);
        var error = this.validationError = this.validate(attrs, options) || null;
        if (!error) return true;
        this.trigger('invalid', this, error, assign(options || {}, {validationError: error}));
        return false;
    },

    _createPropertyDefinition: function (name, desc, isSession) {
        return createPropertyDefinition(this, name, desc, isSession);
    },

    // just makes friendlier errors when trying to define a new model
    // only used when setting up original property definitions
    _ensureValidType: function (type) {
        return includes(['string', 'number', 'boolean', 'array', 'object', 'date', 'state', 'any']
            .concat(Object.keys(this._dataTypes)), type) ? type : undefined;
    },

    getAttributes: function (options, raw) {
        options = assign({
            session: false,
            props: false,
            derived: false
        }, options || {});
        var res = {};
        var val, def;
        for (var item in this._definition) {
            def = this._definition[item];
            if ((options.session && def.session) || (options.props && !def.session)) {
                val = raw ? this._values[item] : this[item];
                if (raw && val && isFunction(val.serialize)) val = val.serialize();
                if (typeof val === 'undefined') val = result(def, 'default');
                if (typeof val !== 'undefined') res[item] = val;
            }
        }
        if (options.derived) {
            for (var derivedItem in this._derived) res[derivedItem] = this[derivedItem];
        }
        return res;
    },

    _initDerived: function () {
        var self = this;

        forOwn(this._derived, function (value, name) {
            var def = self._derived[name];
            def.deps = def.depList;

            var update = function (options) {
                options = options || {};

                var newVal = def.fn.call(self);

                if (self._cache[name] !== newVal || !def.cache) {
                    if (def.cache) {
                        self._previousAttributes[name] = self._cache[name];
                    }
                    self._cache[name] = newVal;
                    self.trigger('change:' + name, self, self._cache[name]);
                }
            };

            def.deps.forEach(function (propString) {
                self._keyTree.add(propString, update);
            });
        });

        this.on('all', function (eventName) {
            if (changeRE.test(eventName)) {
                self._keyTree.get(eventName.split(':')[1]).forEach(function (fn) {
                    fn();
                });
            }
        }, this);
    },

    _getDerivedProperty: function (name, flushCache) {
        // is this a derived property that is cached
        if (this._derived[name].cache) {
            //set if this is the first time, or flushCache is set
            if (flushCache || !this._cache.hasOwnProperty(name)) {
                this._cache[name] = this._derived[name].fn.apply(this);
            }
            return this._cache[name];
        } else {
            return this._derived[name].fn.apply(this);
        }
    },

    _initCollections: function () {
        var coll;
        if (!this._collections) return;
        for (coll in this._collections) {
            this._safeSet(coll, new this._collections[coll](null, {parent: this}));
        }
    },

    _initChildren: function () {
        var child;
        if (!this._children) return;
        for (child in this._children) {
            this._safeSet(child, new this._children[child]({}, {parent: this}));
            this.listenTo(this[child], 'all', this._getCachedEventBubblingHandler(child));
        }
    },

    // Returns a bound handler for doing event bubbling while
    // adding a name to the change string.
    _getCachedEventBubblingHandler: function (propertyName) {
        if (!this._eventBubblingHandlerCache[propertyName]) {
            this._eventBubblingHandlerCache[propertyName] = bind(function (name, model, newValue) {
                if (changeRE.test(name)) {
                    this.trigger('change:' + propertyName + '.' + name.split(':')[1], model, newValue);
                } else if (name === 'change') {
                    this.trigger('change', this);
                }
            }, this);
        }
        return this._eventBubblingHandlerCache[propertyName];
    },

    // Check that all required attributes are present
    _verifyRequired: function () {
        var attrs = this.attributes; // should include session
        for (var def in this._definition) {
            if (this._definition[def].required && typeof attrs[def] === 'undefined') {
                return false;
            }
        }
        return true;
    },

    // expose safeSet method
    _safeSet: function safeSet(property, value) {
        if (property in this) {
            throw new Error('Encountered namespace collision while setting instance property `' + property + '`');
        }
        this[property] = value;
        return this;
    }
});

// getter for attributes
Object.defineProperties(Base.prototype, {
    attributes: {
        get: function () {
            return this.getAttributes({props: true, session: true});
        }
    },
    all: {
        get: function () {
            return this.getAttributes({
                session: true,
                props: true,
                derived: true
            });
        }
    },
    isState: {
        get: function () { return true; },
        set: function () { }
    }
});

// helper for creating/storing property definitions and creating
// appropriate getters/setters
function createPropertyDefinition(object, name, desc, isSession) {
    var def = object._definition[name] = {};
    var type, descArray;

    if (isString(desc)) {
        // grab our type if all we've got is a string
        type = object._ensureValidType(desc);
        if (type) def.type = type;
    } else {
        //Transform array of ['type', required, default] to object form
        if (Array.isArray(desc)) {
            descArray = desc;
            desc = {
                type: descArray[0],
                required: descArray[1],
                'default': descArray[2]
            };
        }

        type = object._ensureValidType(desc.type);
        if (type) def.type = type;

        if (desc.required) def.required = true;

        if (desc['default'] && typeof desc['default'] === 'object') {
            throw new TypeError('The default value for ' + name + ' cannot be an object/array, must be a value or a function which returns a value/object/array');
        }

        def['default'] = desc['default'];

        def.allowNull = desc.allowNull ? desc.allowNull : false;
        if (desc.setOnce) def.setOnce = true;
        if (def.required && def['default'] === undefined && !def.setOnce) def['default'] = object._getDefaultForType(type);
        def.test = desc.test;
        def.values = desc.values;
    }
    if (isSession) def.session = true;

    if (!type) {
        type = isString(desc) ? desc : desc.type;
        // TODO: start throwing a TypeError in future major versions instead of warning
        console.warn('Invalid data type of `' + type + '` for `' + name + '` property. Use one of the default types or define your own');
    }

    // define a getter/setter on the prototype
    // but they get/set on the instance
    Object.defineProperty(object, name, {
        set: function (val) {
            this.set(name, val);
        },
        get: function () {
            if (!this._values) {
                throw Error('You may be trying to `extend` a state object with "' + name + '" which has been defined in `props` on the object being extended');
            }
            var value = this._values[name];
            var typeDef = this._dataTypes[def.type];
            if (typeof value !== 'undefined') {
                if (typeDef && typeDef.get) {
                    value = typeDef.get(value);
                }
                return value;
            }
            var defaultValue = result(def, 'default');
            this._values[name] = defaultValue;
            // If we've set a defaultValue, fire a change handler effectively marking
            // its change from undefined to the default value.
            if (typeof defaultValue !== 'undefined') {
                var onChange = this._getOnChangeForType(def.type);
                onChange(defaultValue, value, name);
            }
            return defaultValue;
        }
    });

    return def;
}

// helper for creating derived property definitions
function createDerivedProperty(modelProto, name, definition) {
    var def = modelProto._derived[name] = {
        fn: isFunction(definition) ? definition : definition.fn,
        cache: (definition.cache !== false),
        depList: definition.deps || []
    };

    // add to our shared dependency list
    def.depList.forEach(function (dep) {
        modelProto._deps[dep] = union(modelProto._deps[dep] || [], [name]);
    });

    // defined a top-level getter for derived names
    Object.defineProperty(modelProto, name, {
        get: function () {
            return this._getDerivedProperty(name);
        },
        set: function () {
            throw new TypeError("`" + name + "` is a derived property, it can't be set directly.");
        }
    });
}

var dataTypes = {
    string: {
        'default': function () {
            return '';
        }
    },
    date: {
        set: function (newVal) {
            var newType;
            if (newVal == null) {
                newType = typeof null;
            } else if (!isDate(newVal)) {
                var err = null;
                var dateVal = new Date(newVal).valueOf();
                if (isNaN(dateVal)) {
                    // If the newVal cant be parsed, then try parseInt first
                    dateVal = new Date(parseInt(newVal, 10)).valueOf();
                    if (isNaN(dateVal)) err = true;
                }
                newVal = dateVal;
                newType = 'date';
                if (err) {
                    newType = typeof newVal;
                }
            } else {
                newType = 'date';
                newVal = newVal.valueOf();
            }

            return {
                val: newVal,
                type: newType
            };
        },
        get: function (val) {
            if (val == null) { return val; }
            return new Date(val);
        },
        'default': function () {
            return new Date();
        }
    },
    array: {
        set: function (newVal) {
            return {
                val: newVal,
                type: Array.isArray(newVal) ? 'array' : typeof newVal
            };
        },
        'default': function () {
            return [];
        }
    },
    object: {
        set: function (newVal) {
            var newType = typeof newVal;
            // we have to have a way of supporting "missing" objects.
            // Null is an object, but setting a value to undefined
            // should work too, IMO. We just override it, in that case.
            if (newType !== 'object' && newVal === undefined) {
                newVal = null;
                newType = 'object';
            }
            return {
                val: newVal,
                type: newType
            };
        },
        'default': function () {
            return {};
        }
    },
    // the `state` data type is a bit special in that setting it should
    // also bubble events
    state: {
        set: function (newVal) {
            var isInstance = newVal instanceof Base || (newVal && newVal.isState);
            if (isInstance) {
                return {
                    val: newVal,
                    type: 'state'
                };
            } else {
                return {
                    val: newVal,
                    type: typeof newVal
                };
            }
        },
        compare: function (currentVal, newVal) {
            return currentVal === newVal;
        },

        onChange : function(newVal, previousVal, attributeName){
            // if this has changed we want to also handle
            // event propagation
            if (previousVal) {
                this.stopListening(previousVal, 'all', this._getCachedEventBubblingHandler(attributeName));
            }

            if (newVal != null) {
                this.listenTo(newVal, 'all', this._getCachedEventBubblingHandler(attributeName));
            }
        }
    }
};

// the extend method used to extend prototypes, maintain inheritance chains for instanceof
// and allow for additions to the model definitions.
function extend(protoProps) {
    /*jshint validthis:true*/
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
    } else {
        child = function () {
            return parent.apply(this, arguments);
        };
    }

    // Add static properties to the constructor function from parent
    assign(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function () { this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // set prototype level objects
    child.prototype._derived =  assign({}, parent.prototype._derived);
    child.prototype._deps = assign({}, parent.prototype._deps);
    child.prototype._definition = assign({}, parent.prototype._definition);
    child.prototype._collections = assign({}, parent.prototype._collections);
    child.prototype._children = assign({}, parent.prototype._children);
    child.prototype._dataTypes = assign({}, parent.prototype._dataTypes || dataTypes);

    // Mix in all prototype properties to the subclass if supplied.
    if (protoProps) {
        var omitFromExtend = [
            'dataTypes', 'props', 'session', 'derived', 'collections', 'children'
        ];
        for(var i = 0; i < arguments.length; i++) {
            var def = arguments[i];
            if (def.dataTypes) {
                forOwn(def.dataTypes, function (def, name) {
                    child.prototype._dataTypes[name] = def;
                });
            }
            if (def.props) {
                forOwn(def.props, function (def, name) {
                    createPropertyDefinition(child.prototype, name, def);
                });
            }
            if (def.session) {
                forOwn(def.session, function (def, name) {
                    createPropertyDefinition(child.prototype, name, def, true);
                });
            }
            if (def.derived) {
                forOwn(def.derived, function (def, name) {
                    createDerivedProperty(child.prototype, name, def);
                });
            }
            if (def.collections) {
                forOwn(def.collections, function (constructor, name) {
                    child.prototype._collections[name] = constructor;
                });
            }
            if (def.children) {
                forOwn(def.children, function (constructor, name) {
                    child.prototype._children[name] = constructor;
                });
            }
            assign(child.prototype, omit(def, omitFromExtend));
        }
    }

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
}

Base.extend = extend;

// Our main exports
module.exports = Base;

},{"ampersand-events":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/ampersand-events/ampersand-events.js","array-next":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/array-next/array-next.js","key-tree-store":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/key-tree-store/key-tree-store.js","lodash/assign":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/assign.js","lodash/bind":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/bind.js","lodash/escape":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/escape.js","lodash/forOwn":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/forOwn.js","lodash/has":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/has.js","lodash/includes":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/includes.js","lodash/isDate":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isDate.js","lodash/isEqual":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isEqual.js","lodash/isFunction":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isFunction.js","lodash/isObject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObject.js","lodash/isString":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isString.js","lodash/omit":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/omit.js","lodash/result":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/result.js","lodash/union":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/union.js","lodash/uniqueId":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/uniqueId.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/ampersand-events/ampersand-events.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/ampersand-events.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/ampersand-events.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-collection-view/node_modules/ampersand-events/ampersand-events.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/array-next/array-next.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/array-next/array-next.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/array-next/array-next.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/array-next/array-next.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/key-tree-store/key-tree-store.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/key-tree-store/key-tree-store.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/key-tree-store/key-tree-store.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/ampersand-state/node_modules/key-tree-store/key-tree-store.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/domify/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/domify/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/domify/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/domify/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/events-mixin/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/events-mixin/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/events-mixin/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/events-mixin/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_DataView.js":[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView');

module.exports = DataView;

},{"./_getNative":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getNative.js","./_root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_root.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Hash.js":[function(require,module,exports){
var hashClear = require('./_hashClear'),
    hashDelete = require('./_hashDelete'),
    hashGet = require('./_hashGet'),
    hashHas = require('./_hashHas'),
    hashSet = require('./_hashSet');

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

module.exports = Hash;

},{"./_hashClear":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_hashClear.js","./_hashDelete":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_hashDelete.js","./_hashGet":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_hashGet.js","./_hashHas":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_hashHas.js","./_hashSet":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_hashSet.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_LazyWrapper.js":[function(require,module,exports){
var baseCreate = require('./_baseCreate'),
    baseLodash = require('./_baseLodash');

/** Used as references for the maximum length and index of an array. */
var MAX_ARRAY_LENGTH = 4294967295;

/**
 * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
 *
 * @private
 * @constructor
 * @param {*} value The value to wrap.
 */
function LazyWrapper(value) {
  this.__wrapped__ = value;
  this.__actions__ = [];
  this.__dir__ = 1;
  this.__filtered__ = false;
  this.__iteratees__ = [];
  this.__takeCount__ = MAX_ARRAY_LENGTH;
  this.__views__ = [];
}

// Ensure `LazyWrapper` is an instance of `baseLodash`.
LazyWrapper.prototype = baseCreate(baseLodash.prototype);
LazyWrapper.prototype.constructor = LazyWrapper;

module.exports = LazyWrapper;

},{"./_baseCreate":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseCreate.js","./_baseLodash":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseLodash.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_ListCache.js":[function(require,module,exports){
var listCacheClear = require('./_listCacheClear'),
    listCacheDelete = require('./_listCacheDelete'),
    listCacheGet = require('./_listCacheGet'),
    listCacheHas = require('./_listCacheHas'),
    listCacheSet = require('./_listCacheSet');

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;

},{"./_listCacheClear":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_listCacheClear.js","./_listCacheDelete":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_listCacheDelete.js","./_listCacheGet":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_listCacheGet.js","./_listCacheHas":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_listCacheHas.js","./_listCacheSet":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_listCacheSet.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_LodashWrapper.js":[function(require,module,exports){
var baseCreate = require('./_baseCreate'),
    baseLodash = require('./_baseLodash');

/**
 * The base constructor for creating `lodash` wrapper objects.
 *
 * @private
 * @param {*} value The value to wrap.
 * @param {boolean} [chainAll] Enable explicit method chain sequences.
 */
function LodashWrapper(value, chainAll) {
  this.__wrapped__ = value;
  this.__actions__ = [];
  this.__chain__ = !!chainAll;
  this.__index__ = 0;
  this.__values__ = undefined;
}

LodashWrapper.prototype = baseCreate(baseLodash.prototype);
LodashWrapper.prototype.constructor = LodashWrapper;

module.exports = LodashWrapper;

},{"./_baseCreate":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseCreate.js","./_baseLodash":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseLodash.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Map.js":[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;

},{"./_getNative":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getNative.js","./_root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_root.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_MapCache.js":[function(require,module,exports){
var mapCacheClear = require('./_mapCacheClear'),
    mapCacheDelete = require('./_mapCacheDelete'),
    mapCacheGet = require('./_mapCacheGet'),
    mapCacheHas = require('./_mapCacheHas'),
    mapCacheSet = require('./_mapCacheSet');

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

module.exports = MapCache;

},{"./_mapCacheClear":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_mapCacheClear.js","./_mapCacheDelete":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_mapCacheDelete.js","./_mapCacheGet":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_mapCacheGet.js","./_mapCacheHas":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_mapCacheHas.js","./_mapCacheSet":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_mapCacheSet.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Promise.js":[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var Promise = getNative(root, 'Promise');

module.exports = Promise;

},{"./_getNative":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getNative.js","./_root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_root.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Reflect.js":[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Reflect = root.Reflect;

module.exports = Reflect;

},{"./_root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_root.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Set.js":[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var Set = getNative(root, 'Set');

module.exports = Set;

},{"./_getNative":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getNative.js","./_root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_root.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_SetCache.js":[function(require,module,exports){
var MapCache = require('./_MapCache'),
    setCacheAdd = require('./_setCacheAdd'),
    setCacheHas = require('./_setCacheHas');

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values ? values.length : 0;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

module.exports = SetCache;

},{"./_MapCache":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_MapCache.js","./_setCacheAdd":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_setCacheAdd.js","./_setCacheHas":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_setCacheHas.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Stack.js":[function(require,module,exports){
var ListCache = require('./_ListCache'),
    stackClear = require('./_stackClear'),
    stackDelete = require('./_stackDelete'),
    stackGet = require('./_stackGet'),
    stackHas = require('./_stackHas'),
    stackSet = require('./_stackSet');

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

module.exports = Stack;

},{"./_ListCache":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_ListCache.js","./_stackClear":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_stackClear.js","./_stackDelete":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_stackDelete.js","./_stackGet":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_stackGet.js","./_stackHas":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_stackHas.js","./_stackSet":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_stackSet.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Symbol.js":[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_root.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Uint8Array.js":[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

module.exports = Uint8Array;

},{"./_root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_root.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_WeakMap.js":[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var WeakMap = getNative(root, 'WeakMap');

module.exports = WeakMap;

},{"./_getNative":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getNative.js","./_root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_root.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_apply.js":[function(require,module,exports){
/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  var length = args.length;
  switch (length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

module.exports = apply;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayEach.js":[function(require,module,exports){
/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayIncludes.js":[function(require,module,exports){
var baseIndexOf = require('./_baseIndexOf');

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to search.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array ? array.length : 0;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

module.exports = arrayIncludes;

},{"./_baseIndexOf":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIndexOf.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayIncludesWith.js":[function(require,module,exports){
/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to search.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

module.exports = arrayIncludesWith;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayMap.js":[function(require,module,exports){
/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayPush.js":[function(require,module,exports){
/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

module.exports = arrayPush;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayReduce.js":[function(require,module,exports){
/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array ? array.length : 0;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

module.exports = arrayReduce;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arraySome.js":[function(require,module,exports){
/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

module.exports = arraySome;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_assignValue.js":[function(require,module,exports){
var eq = require('./eq');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

module.exports = assignValue;

},{"./eq":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/eq.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_assocIndexOf.js":[function(require,module,exports){
var eq = require('./eq');

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

module.exports = assocIndexOf;

},{"./eq":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/eq.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseCreate.js":[function(require,module,exports){
var isObject = require('./isObject');

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(proto) {
  return isObject(proto) ? objectCreate(proto) : {};
}

module.exports = baseCreate;

},{"./isObject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObject.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseDifference.js":[function(require,module,exports){
var SetCache = require('./_SetCache'),
    arrayIncludes = require('./_arrayIncludes'),
    arrayIncludesWith = require('./_arrayIncludesWith'),
    arrayMap = require('./_arrayMap'),
    baseUnary = require('./_baseUnary'),
    cacheHas = require('./_cacheHas');

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * The base implementation of methods like `_.difference` without support
 * for excluding multiple arrays or iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Array} values The values to exclude.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of filtered values.
 */
function baseDifference(array, values, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      isCommon = true,
      length = array.length,
      result = [],
      valuesLength = values.length;

  if (!length) {
    return result;
  }
  if (iteratee) {
    values = arrayMap(values, baseUnary(iteratee));
  }
  if (comparator) {
    includes = arrayIncludesWith;
    isCommon = false;
  }
  else if (values.length >= LARGE_ARRAY_SIZE) {
    includes = cacheHas;
    isCommon = false;
    values = new SetCache(values);
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var valuesIndex = valuesLength;
      while (valuesIndex--) {
        if (values[valuesIndex] === computed) {
          continue outer;
        }
      }
      result.push(value);
    }
    else if (!includes(values, computed, comparator)) {
      result.push(value);
    }
  }
  return result;
}

module.exports = baseDifference;

},{"./_SetCache":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_SetCache.js","./_arrayIncludes":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayIncludes.js","./_arrayIncludesWith":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayIncludesWith.js","./_arrayMap":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayMap.js","./_baseUnary":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseUnary.js","./_cacheHas":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_cacheHas.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseEach.js":[function(require,module,exports){
var baseForOwn = require('./_baseForOwn'),
    createBaseEach = require('./_createBaseEach');

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach = createBaseEach(baseForOwn);

module.exports = baseEach;

},{"./_baseForOwn":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseForOwn.js","./_createBaseEach":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createBaseEach.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseFindIndex.js":[function(require,module,exports){
/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

module.exports = baseFindIndex;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseFlatten.js":[function(require,module,exports){
var arrayPush = require('./_arrayPush'),
    isFlattenable = require('./_isFlattenable');

/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

module.exports = baseFlatten;

},{"./_arrayPush":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayPush.js","./_isFlattenable":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isFlattenable.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseFor.js":[function(require,module,exports){
var createBaseFor = require('./_createBaseFor');

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

module.exports = baseFor;

},{"./_createBaseFor":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createBaseFor.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseForOwn.js":[function(require,module,exports){
var baseFor = require('./_baseFor'),
    keys = require('./keys');

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

module.exports = baseForOwn;

},{"./_baseFor":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseFor.js","./keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/keys.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseGet.js":[function(require,module,exports){
var castPath = require('./_castPath'),
    isKey = require('./_isKey'),
    toKey = require('./_toKey');

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = isKey(path, object) ? [path] : castPath(path);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

module.exports = baseGet;

},{"./_castPath":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_castPath.js","./_isKey":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isKey.js","./_toKey":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_toKey.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseGetAllKeys.js":[function(require,module,exports){
var arrayPush = require('./_arrayPush'),
    isArray = require('./isArray');

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

module.exports = baseGetAllKeys;

},{"./_arrayPush":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayPush.js","./isArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArray.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseHas.js":[function(require,module,exports){
var getPrototype = require('./_getPrototype');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.has` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHas(object, key) {
  // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
  // that are composed entirely of index properties, return `false` for
  // `hasOwnProperty` checks of them.
  return object != null &&
    (hasOwnProperty.call(object, key) ||
      (typeof object == 'object' && key in object && getPrototype(object) === null));
}

module.exports = baseHas;

},{"./_getPrototype":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getPrototype.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseHasIn.js":[function(require,module,exports){
/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

module.exports = baseHasIn;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIndexOf.js":[function(require,module,exports){
var indexOfNaN = require('./_indexOfNaN');

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return indexOfNaN(array, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

module.exports = baseIndexOf;

},{"./_indexOfNaN":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_indexOfNaN.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseInvoke.js":[function(require,module,exports){
var apply = require('./_apply'),
    castPath = require('./_castPath'),
    isKey = require('./_isKey'),
    last = require('./last'),
    parent = require('./_parent'),
    toKey = require('./_toKey');

/**
 * The base implementation of `_.invoke` without support for individual
 * method arguments.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the method to invoke.
 * @param {Array} args The arguments to invoke the method with.
 * @returns {*} Returns the result of the invoked method.
 */
function baseInvoke(object, path, args) {
  if (!isKey(path, object)) {
    path = castPath(path);
    object = parent(object, path);
    path = last(path);
  }
  var func = object == null ? object : object[toKey(path)];
  return func == null ? undefined : apply(func, object, args);
}

module.exports = baseInvoke;

},{"./_apply":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_apply.js","./_castPath":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_castPath.js","./_isKey":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isKey.js","./_parent":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_parent.js","./_toKey":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_toKey.js","./last":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/last.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIsEqual.js":[function(require,module,exports){
var baseIsEqualDeep = require('./_baseIsEqualDeep'),
    isObject = require('./isObject'),
    isObjectLike = require('./isObjectLike');

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {boolean} [bitmask] The bitmask of comparison flags.
 *  The bitmask may be composed of the following flags:
 *     1 - Unordered comparison
 *     2 - Partial comparison
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, customizer, bitmask, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
}

module.exports = baseIsEqual;

},{"./_baseIsEqualDeep":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIsEqualDeep.js","./isObject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObject.js","./isObjectLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObjectLike.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIsEqualDeep.js":[function(require,module,exports){
var Stack = require('./_Stack'),
    equalArrays = require('./_equalArrays'),
    equalByTag = require('./_equalByTag'),
    equalObjects = require('./_equalObjects'),
    getTag = require('./_getTag'),
    isArray = require('./isArray'),
    isHostObject = require('./_isHostObject'),
    isTypedArray = require('./isTypedArray');

/** Used to compose bitmasks for comparison styles. */
var PARTIAL_COMPARE_FLAG = 2;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = arrayTag,
      othTag = arrayTag;

  if (!objIsArr) {
    objTag = getTag(object);
    objTag = objTag == argsTag ? objectTag : objTag;
  }
  if (!othIsArr) {
    othTag = getTag(other);
    othTag = othTag == argsTag ? objectTag : othTag;
  }
  var objIsObj = objTag == objectTag && !isHostObject(object),
      othIsObj = othTag == objectTag && !isHostObject(other),
      isSameTag = objTag == othTag;

  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
      : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
  }
  if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
}

module.exports = baseIsEqualDeep;

},{"./_Stack":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Stack.js","./_equalArrays":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_equalArrays.js","./_equalByTag":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_equalByTag.js","./_equalObjects":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_equalObjects.js","./_getTag":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getTag.js","./_isHostObject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isHostObject.js","./isArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArray.js","./isTypedArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isTypedArray.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIsMatch.js":[function(require,module,exports){
var Stack = require('./_Stack'),
    baseIsEqual = require('./_baseIsEqual');

/** Used to compose bitmasks for comparison styles. */
var UNORDERED_COMPARE_FLAG = 1,
    PARTIAL_COMPARE_FLAG = 2;

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

module.exports = baseIsMatch;

},{"./_Stack":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Stack.js","./_baseIsEqual":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIsEqual.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIsNative.js":[function(require,module,exports){
var isFunction = require('./isFunction'),
    isHostObject = require('./_isHostObject'),
    isMasked = require('./_isMasked'),
    isObject = require('./isObject'),
    toSource = require('./_toSource');

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;

},{"./_isHostObject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isHostObject.js","./_isMasked":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isMasked.js","./_toSource":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_toSource.js","./isFunction":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isFunction.js","./isObject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObject.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIteratee.js":[function(require,module,exports){
var baseMatches = require('./_baseMatches'),
    baseMatchesProperty = require('./_baseMatchesProperty'),
    identity = require('./identity'),
    isArray = require('./isArray'),
    property = require('./property');

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == 'object') {
    return isArray(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}

module.exports = baseIteratee;

},{"./_baseMatches":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseMatches.js","./_baseMatchesProperty":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseMatchesProperty.js","./identity":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/identity.js","./isArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArray.js","./property":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/property.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseKeys.js":[function(require,module,exports){
/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = Object.keys;

/**
 * The base implementation of `_.keys` which doesn't skip the constructor
 * property of prototypes or treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  return nativeKeys(Object(object));
}

module.exports = baseKeys;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseKeysIn.js":[function(require,module,exports){
var Reflect = require('./_Reflect'),
    iteratorToArray = require('./_iteratorToArray');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Built-in value references. */
var enumerate = Reflect ? Reflect.enumerate : undefined,
    propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * The base implementation of `_.keysIn` which doesn't skip the constructor
 * property of prototypes or treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  object = object == null ? object : Object(object);

  var result = [];
  for (var key in object) {
    result.push(key);
  }
  return result;
}

// Fallback for IE < 9 with es6-shim.
if (enumerate && !propertyIsEnumerable.call({ 'valueOf': 1 }, 'valueOf')) {
  baseKeysIn = function(object) {
    return iteratorToArray(enumerate(object));
  };
}

module.exports = baseKeysIn;

},{"./_Reflect":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Reflect.js","./_iteratorToArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_iteratorToArray.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseLodash.js":[function(require,module,exports){
/**
 * The function whose prototype chain sequence wrappers inherit from.
 *
 * @private
 */
function baseLodash() {
  // No operation performed.
}

module.exports = baseLodash;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseMatches.js":[function(require,module,exports){
var baseIsMatch = require('./_baseIsMatch'),
    getMatchData = require('./_getMatchData'),
    matchesStrictComparable = require('./_matchesStrictComparable');

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

module.exports = baseMatches;

},{"./_baseIsMatch":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIsMatch.js","./_getMatchData":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getMatchData.js","./_matchesStrictComparable":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_matchesStrictComparable.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseMatchesProperty.js":[function(require,module,exports){
var baseIsEqual = require('./_baseIsEqual'),
    get = require('./get'),
    hasIn = require('./hasIn'),
    isKey = require('./_isKey'),
    isStrictComparable = require('./_isStrictComparable'),
    matchesStrictComparable = require('./_matchesStrictComparable'),
    toKey = require('./_toKey');

/** Used to compose bitmasks for comparison styles. */
var UNORDERED_COMPARE_FLAG = 1,
    PARTIAL_COMPARE_FLAG = 2;

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
  };
}

module.exports = baseMatchesProperty;

},{"./_baseIsEqual":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIsEqual.js","./_isKey":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isKey.js","./_isStrictComparable":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isStrictComparable.js","./_matchesStrictComparable":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_matchesStrictComparable.js","./_toKey":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_toKey.js","./get":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/get.js","./hasIn":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/hasIn.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_basePick.js":[function(require,module,exports){
var arrayReduce = require('./_arrayReduce');

/**
 * The base implementation of `_.pick` without support for individual
 * property identifiers.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} props The property identifiers to pick.
 * @returns {Object} Returns the new object.
 */
function basePick(object, props) {
  object = Object(object);
  return arrayReduce(props, function(result, key) {
    if (key in object) {
      result[key] = object[key];
    }
    return result;
  }, {});
}

module.exports = basePick;

},{"./_arrayReduce":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayReduce.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseProperty.js":[function(require,module,exports){
/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

module.exports = baseProperty;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_basePropertyDeep.js":[function(require,module,exports){
var baseGet = require('./_baseGet');

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}

module.exports = basePropertyDeep;

},{"./_baseGet":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseGet.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseSetData.js":[function(require,module,exports){
var identity = require('./identity'),
    metaMap = require('./_metaMap');

/**
 * The base implementation of `setData` without support for hot loop detection.
 *
 * @private
 * @param {Function} func The function to associate metadata with.
 * @param {*} data The metadata.
 * @returns {Function} Returns `func`.
 */
var baseSetData = !metaMap ? identity : function(func, data) {
  metaMap.set(func, data);
  return func;
};

module.exports = baseSetData;

},{"./_metaMap":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_metaMap.js","./identity":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/identity.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseSlice.js":[function(require,module,exports){
/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

module.exports = baseSlice;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseTimes.js":[function(require,module,exports){
/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseToString.js":[function(require,module,exports){
var Symbol = require('./_Symbol'),
    isSymbol = require('./isSymbol');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = baseToString;

},{"./_Symbol":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Symbol.js","./isSymbol":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isSymbol.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseUnary.js":[function(require,module,exports){
/**
 * The base implementation of `_.unary` without support for storing wrapper metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseUniq.js":[function(require,module,exports){
var SetCache = require('./_SetCache'),
    arrayIncludes = require('./_arrayIncludes'),
    arrayIncludesWith = require('./_arrayIncludesWith'),
    cacheHas = require('./_cacheHas'),
    createSet = require('./_createSet'),
    setToArray = require('./_setToArray');

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  }
  else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : createSet(array);
    if (set) {
      return setToArray(set);
    }
    isCommon = false;
    includes = cacheHas;
    seen = new SetCache;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

module.exports = baseUniq;

},{"./_SetCache":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_SetCache.js","./_arrayIncludes":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayIncludes.js","./_arrayIncludesWith":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayIncludesWith.js","./_cacheHas":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_cacheHas.js","./_createSet":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createSet.js","./_setToArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_setToArray.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseValues.js":[function(require,module,exports){
var arrayMap = require('./_arrayMap');

/**
 * The base implementation of `_.values` and `_.valuesIn` which creates an
 * array of `object` property values corresponding to the property names
 * of `props`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} props The property names to get values for.
 * @returns {Object} Returns the array of property values.
 */
function baseValues(object, props) {
  return arrayMap(props, function(key) {
    return object[key];
  });
}

module.exports = baseValues;

},{"./_arrayMap":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayMap.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_cacheHas.js":[function(require,module,exports){
/**
 * Checks if a cache value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

module.exports = cacheHas;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_castPath.js":[function(require,module,exports){
var isArray = require('./isArray'),
    stringToPath = require('./_stringToPath');

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value) {
  return isArray(value) ? value : stringToPath(value);
}

module.exports = castPath;

},{"./_stringToPath":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_stringToPath.js","./isArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArray.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_checkGlobal.js":[function(require,module,exports){
/**
 * Checks if `value` is a global object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
 */
function checkGlobal(value) {
  return (value && value.Object === Object) ? value : null;
}

module.exports = checkGlobal;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_composeArgs.js":[function(require,module,exports){
/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates an array that is the composition of partially applied arguments,
 * placeholders, and provided arguments into a single array of arguments.
 *
 * @private
 * @param {Array} args The provided arguments.
 * @param {Array} partials The arguments to prepend to those provided.
 * @param {Array} holders The `partials` placeholder indexes.
 * @params {boolean} [isCurried] Specify composing for a curried function.
 * @returns {Array} Returns the new array of composed arguments.
 */
function composeArgs(args, partials, holders, isCurried) {
  var argsIndex = -1,
      argsLength = args.length,
      holdersLength = holders.length,
      leftIndex = -1,
      leftLength = partials.length,
      rangeLength = nativeMax(argsLength - holdersLength, 0),
      result = Array(leftLength + rangeLength),
      isUncurried = !isCurried;

  while (++leftIndex < leftLength) {
    result[leftIndex] = partials[leftIndex];
  }
  while (++argsIndex < holdersLength) {
    if (isUncurried || argsIndex < argsLength) {
      result[holders[argsIndex]] = args[argsIndex];
    }
  }
  while (rangeLength--) {
    result[leftIndex++] = args[argsIndex++];
  }
  return result;
}

module.exports = composeArgs;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_composeArgsRight.js":[function(require,module,exports){
/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * This function is like `composeArgs` except that the arguments composition
 * is tailored for `_.partialRight`.
 *
 * @private
 * @param {Array} args The provided arguments.
 * @param {Array} partials The arguments to append to those provided.
 * @param {Array} holders The `partials` placeholder indexes.
 * @params {boolean} [isCurried] Specify composing for a curried function.
 * @returns {Array} Returns the new array of composed arguments.
 */
function composeArgsRight(args, partials, holders, isCurried) {
  var argsIndex = -1,
      argsLength = args.length,
      holdersIndex = -1,
      holdersLength = holders.length,
      rightIndex = -1,
      rightLength = partials.length,
      rangeLength = nativeMax(argsLength - holdersLength, 0),
      result = Array(rangeLength + rightLength),
      isUncurried = !isCurried;

  while (++argsIndex < rangeLength) {
    result[argsIndex] = args[argsIndex];
  }
  var offset = argsIndex;
  while (++rightIndex < rightLength) {
    result[offset + rightIndex] = partials[rightIndex];
  }
  while (++holdersIndex < holdersLength) {
    if (isUncurried || argsIndex < argsLength) {
      result[offset + holders[holdersIndex]] = args[argsIndex++];
    }
  }
  return result;
}

module.exports = composeArgsRight;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_copyArray.js":[function(require,module,exports){
/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = copyArray;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_copyObject.js":[function(require,module,exports){
var assignValue = require('./_assignValue');

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : source[key];

    assignValue(object, key, newValue);
  }
  return object;
}

module.exports = copyObject;

},{"./_assignValue":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_assignValue.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_coreJsData.js":[function(require,module,exports){
var root = require('./_root');

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;

},{"./_root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_root.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_countHolders.js":[function(require,module,exports){
/**
 * Gets the number of `placeholder` occurrences in `array`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} placeholder The placeholder to search for.
 * @returns {number} Returns the placeholder count.
 */
function countHolders(array, placeholder) {
  var length = array.length,
      result = 0;

  while (length--) {
    if (array[length] === placeholder) {
      result++;
    }
  }
  return result;
}

module.exports = countHolders;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createAssigner.js":[function(require,module,exports){
var isIterateeCall = require('./_isIterateeCall'),
    rest = require('./rest');

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return rest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;

},{"./_isIterateeCall":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isIterateeCall.js","./rest":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/rest.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createBaseEach.js":[function(require,module,exports){
var isArrayLike = require('./isArrayLike');

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

module.exports = createBaseEach;

},{"./isArrayLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArrayLike.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createBaseFor.js":[function(require,module,exports){
/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = createBaseFor;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createBaseWrapper.js":[function(require,module,exports){
var createCtorWrapper = require('./_createCtorWrapper'),
    root = require('./_root');

/** Used to compose bitmasks for wrapper metadata. */
var BIND_FLAG = 1;

/**
 * Creates a function that wraps `func` to invoke it with the optional `this`
 * binding of `thisArg`.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {number} bitmask The bitmask of wrapper flags. See `createWrapper`
 *  for more details.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createBaseWrapper(func, bitmask, thisArg) {
  var isBind = bitmask & BIND_FLAG,
      Ctor = createCtorWrapper(func);

  function wrapper() {
    var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
    return fn.apply(isBind ? thisArg : this, arguments);
  }
  return wrapper;
}

module.exports = createBaseWrapper;

},{"./_createCtorWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createCtorWrapper.js","./_root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_root.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createCtorWrapper.js":[function(require,module,exports){
var baseCreate = require('./_baseCreate'),
    isObject = require('./isObject');

/**
 * Creates a function that produces an instance of `Ctor` regardless of
 * whether it was invoked as part of a `new` expression or by `call` or `apply`.
 *
 * @private
 * @param {Function} Ctor The constructor to wrap.
 * @returns {Function} Returns the new wrapped function.
 */
function createCtorWrapper(Ctor) {
  return function() {
    // Use a `switch` statement to work with class constructors. See
    // http://ecma-international.org/ecma-262/6.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
    // for more details.
    var args = arguments;
    switch (args.length) {
      case 0: return new Ctor;
      case 1: return new Ctor(args[0]);
      case 2: return new Ctor(args[0], args[1]);
      case 3: return new Ctor(args[0], args[1], args[2]);
      case 4: return new Ctor(args[0], args[1], args[2], args[3]);
      case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
      case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
      case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
    }
    var thisBinding = baseCreate(Ctor.prototype),
        result = Ctor.apply(thisBinding, args);

    // Mimic the constructor's `return` behavior.
    // See https://es5.github.io/#x13.2.2 for more details.
    return isObject(result) ? result : thisBinding;
  };
}

module.exports = createCtorWrapper;

},{"./_baseCreate":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseCreate.js","./isObject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObject.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createCurryWrapper.js":[function(require,module,exports){
var apply = require('./_apply'),
    createCtorWrapper = require('./_createCtorWrapper'),
    createHybridWrapper = require('./_createHybridWrapper'),
    createRecurryWrapper = require('./_createRecurryWrapper'),
    getHolder = require('./_getHolder'),
    replaceHolders = require('./_replaceHolders'),
    root = require('./_root');

/**
 * Creates a function that wraps `func` to enable currying.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {number} bitmask The bitmask of wrapper flags. See `createWrapper`
 *  for more details.
 * @param {number} arity The arity of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createCurryWrapper(func, bitmask, arity) {
  var Ctor = createCtorWrapper(func);

  function wrapper() {
    var length = arguments.length,
        args = Array(length),
        index = length,
        placeholder = getHolder(wrapper);

    while (index--) {
      args[index] = arguments[index];
    }
    var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)
      ? []
      : replaceHolders(args, placeholder);

    length -= holders.length;
    if (length < arity) {
      return createRecurryWrapper(
        func, bitmask, createHybridWrapper, wrapper.placeholder, undefined,
        args, holders, undefined, undefined, arity - length);
    }
    var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
    return apply(fn, this, args);
  }
  return wrapper;
}

module.exports = createCurryWrapper;

},{"./_apply":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_apply.js","./_createCtorWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createCtorWrapper.js","./_createHybridWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createHybridWrapper.js","./_createRecurryWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createRecurryWrapper.js","./_getHolder":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getHolder.js","./_replaceHolders":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_replaceHolders.js","./_root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_root.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createFind.js":[function(require,module,exports){
var baseIteratee = require('./_baseIteratee'),
    isArrayLike = require('./isArrayLike'),
    keys = require('./keys');

/**
 * Creates a `_.find` or `_.findLast` function.
 *
 * @private
 * @param {Function} findIndexFunc The function to find the collection index.
 * @returns {Function} Returns the new find function.
 */
function createFind(findIndexFunc) {
  return function(collection, predicate, fromIndex) {
    var iterable = Object(collection);
    predicate = baseIteratee(predicate, 3);
    if (!isArrayLike(collection)) {
      var props = keys(collection);
    }
    var index = findIndexFunc(props || collection, function(value, key) {
      if (props) {
        key = value;
        value = iterable[key];
      }
      return predicate(value, key, iterable);
    }, fromIndex);
    return index > -1 ? collection[props ? props[index] : index] : undefined;
  };
}

module.exports = createFind;

},{"./_baseIteratee":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIteratee.js","./isArrayLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArrayLike.js","./keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/keys.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createHybridWrapper.js":[function(require,module,exports){
var composeArgs = require('./_composeArgs'),
    composeArgsRight = require('./_composeArgsRight'),
    countHolders = require('./_countHolders'),
    createCtorWrapper = require('./_createCtorWrapper'),
    createRecurryWrapper = require('./_createRecurryWrapper'),
    getHolder = require('./_getHolder'),
    reorder = require('./_reorder'),
    replaceHolders = require('./_replaceHolders'),
    root = require('./_root');

/** Used to compose bitmasks for wrapper metadata. */
var BIND_FLAG = 1,
    BIND_KEY_FLAG = 2,
    CURRY_FLAG = 8,
    CURRY_RIGHT_FLAG = 16,
    ARY_FLAG = 128,
    FLIP_FLAG = 512;

/**
 * Creates a function that wraps `func` to invoke it with optional `this`
 * binding of `thisArg`, partial application, and currying.
 *
 * @private
 * @param {Function|string} func The function or method name to wrap.
 * @param {number} bitmask The bitmask of wrapper flags. See `createWrapper`
 *  for more details.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {Array} [partials] The arguments to prepend to those provided to
 *  the new function.
 * @param {Array} [holders] The `partials` placeholder indexes.
 * @param {Array} [partialsRight] The arguments to append to those provided
 *  to the new function.
 * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
 * @param {Array} [argPos] The argument positions of the new function.
 * @param {number} [ary] The arity cap of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
  var isAry = bitmask & ARY_FLAG,
      isBind = bitmask & BIND_FLAG,
      isBindKey = bitmask & BIND_KEY_FLAG,
      isCurried = bitmask & (CURRY_FLAG | CURRY_RIGHT_FLAG),
      isFlip = bitmask & FLIP_FLAG,
      Ctor = isBindKey ? undefined : createCtorWrapper(func);

  function wrapper() {
    var length = arguments.length,
        args = Array(length),
        index = length;

    while (index--) {
      args[index] = arguments[index];
    }
    if (isCurried) {
      var placeholder = getHolder(wrapper),
          holdersCount = countHolders(args, placeholder);
    }
    if (partials) {
      args = composeArgs(args, partials, holders, isCurried);
    }
    if (partialsRight) {
      args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
    }
    length -= holdersCount;
    if (isCurried && length < arity) {
      var newHolders = replaceHolders(args, placeholder);
      return createRecurryWrapper(
        func, bitmask, createHybridWrapper, wrapper.placeholder, thisArg,
        args, newHolders, argPos, ary, arity - length
      );
    }
    var thisBinding = isBind ? thisArg : this,
        fn = isBindKey ? thisBinding[func] : func;

    length = args.length;
    if (argPos) {
      args = reorder(args, argPos);
    } else if (isFlip && length > 1) {
      args.reverse();
    }
    if (isAry && ary < length) {
      args.length = ary;
    }
    if (this && this !== root && this instanceof wrapper) {
      fn = Ctor || createCtorWrapper(fn);
    }
    return fn.apply(thisBinding, args);
  }
  return wrapper;
}

module.exports = createHybridWrapper;

},{"./_composeArgs":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_composeArgs.js","./_composeArgsRight":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_composeArgsRight.js","./_countHolders":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_countHolders.js","./_createCtorWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createCtorWrapper.js","./_createRecurryWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createRecurryWrapper.js","./_getHolder":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getHolder.js","./_reorder":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_reorder.js","./_replaceHolders":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_replaceHolders.js","./_root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_root.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createPartialWrapper.js":[function(require,module,exports){
var apply = require('./_apply'),
    createCtorWrapper = require('./_createCtorWrapper'),
    root = require('./_root');

/** Used to compose bitmasks for wrapper metadata. */
var BIND_FLAG = 1;

/**
 * Creates a function that wraps `func` to invoke it with the `this` binding
 * of `thisArg` and `partials` prepended to the arguments it receives.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {number} bitmask The bitmask of wrapper flags. See `createWrapper`
 *  for more details.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} partials The arguments to prepend to those provided to
 *  the new function.
 * @returns {Function} Returns the new wrapped function.
 */
function createPartialWrapper(func, bitmask, thisArg, partials) {
  var isBind = bitmask & BIND_FLAG,
      Ctor = createCtorWrapper(func);

  function wrapper() {
    var argsIndex = -1,
        argsLength = arguments.length,
        leftIndex = -1,
        leftLength = partials.length,
        args = Array(leftLength + argsLength),
        fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;

    while (++leftIndex < leftLength) {
      args[leftIndex] = partials[leftIndex];
    }
    while (argsLength--) {
      args[leftIndex++] = arguments[++argsIndex];
    }
    return apply(fn, isBind ? thisArg : this, args);
  }
  return wrapper;
}

module.exports = createPartialWrapper;

},{"./_apply":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_apply.js","./_createCtorWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createCtorWrapper.js","./_root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_root.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createRecurryWrapper.js":[function(require,module,exports){
var isLaziable = require('./_isLaziable'),
    setData = require('./_setData');

/** Used to compose bitmasks for wrapper metadata. */
var BIND_FLAG = 1,
    BIND_KEY_FLAG = 2,
    CURRY_BOUND_FLAG = 4,
    CURRY_FLAG = 8,
    PARTIAL_FLAG = 32,
    PARTIAL_RIGHT_FLAG = 64;

/**
 * Creates a function that wraps `func` to continue currying.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {number} bitmask The bitmask of wrapper flags. See `createWrapper`
 *  for more details.
 * @param {Function} wrapFunc The function to create the `func` wrapper.
 * @param {*} placeholder The placeholder value.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {Array} [partials] The arguments to prepend to those provided to
 *  the new function.
 * @param {Array} [holders] The `partials` placeholder indexes.
 * @param {Array} [argPos] The argument positions of the new function.
 * @param {number} [ary] The arity cap of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createRecurryWrapper(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
  var isCurry = bitmask & CURRY_FLAG,
      newHolders = isCurry ? holders : undefined,
      newHoldersRight = isCurry ? undefined : holders,
      newPartials = isCurry ? partials : undefined,
      newPartialsRight = isCurry ? undefined : partials;

  bitmask |= (isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG);
  bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);

  if (!(bitmask & CURRY_BOUND_FLAG)) {
    bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);
  }
  var newData = [
    func, bitmask, thisArg, newPartials, newHolders, newPartialsRight,
    newHoldersRight, argPos, ary, arity
  ];

  var result = wrapFunc.apply(undefined, newData);
  if (isLaziable(func)) {
    setData(result, newData);
  }
  result.placeholder = placeholder;
  return result;
}

module.exports = createRecurryWrapper;

},{"./_isLaziable":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isLaziable.js","./_setData":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_setData.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createSet.js":[function(require,module,exports){
var Set = require('./_Set'),
    noop = require('./noop'),
    setToArray = require('./_setToArray');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Creates a set of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
  return new Set(values);
};

module.exports = createSet;

},{"./_Set":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Set.js","./_setToArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_setToArray.js","./noop":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/noop.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createWrapper.js":[function(require,module,exports){
var baseSetData = require('./_baseSetData'),
    createBaseWrapper = require('./_createBaseWrapper'),
    createCurryWrapper = require('./_createCurryWrapper'),
    createHybridWrapper = require('./_createHybridWrapper'),
    createPartialWrapper = require('./_createPartialWrapper'),
    getData = require('./_getData'),
    mergeData = require('./_mergeData'),
    setData = require('./_setData'),
    toInteger = require('./toInteger');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to compose bitmasks for wrapper metadata. */
var BIND_FLAG = 1,
    BIND_KEY_FLAG = 2,
    CURRY_FLAG = 8,
    CURRY_RIGHT_FLAG = 16,
    PARTIAL_FLAG = 32,
    PARTIAL_RIGHT_FLAG = 64;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a function that either curries or invokes `func` with optional
 * `this` binding and partially applied arguments.
 *
 * @private
 * @param {Function|string} func The function or method name to wrap.
 * @param {number} bitmask The bitmask of wrapper flags.
 *  The bitmask may be composed of the following flags:
 *     1 - `_.bind`
 *     2 - `_.bindKey`
 *     4 - `_.curry` or `_.curryRight` of a bound function
 *     8 - `_.curry`
 *    16 - `_.curryRight`
 *    32 - `_.partial`
 *    64 - `_.partialRight`
 *   128 - `_.rearg`
 *   256 - `_.ary`
 *   512 - `_.flip`
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {Array} [partials] The arguments to be partially applied.
 * @param {Array} [holders] The `partials` placeholder indexes.
 * @param {Array} [argPos] The argument positions of the new function.
 * @param {number} [ary] The arity cap of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
  var isBindKey = bitmask & BIND_KEY_FLAG;
  if (!isBindKey && typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var length = partials ? partials.length : 0;
  if (!length) {
    bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);
    partials = holders = undefined;
  }
  ary = ary === undefined ? ary : nativeMax(toInteger(ary), 0);
  arity = arity === undefined ? arity : toInteger(arity);
  length -= holders ? holders.length : 0;

  if (bitmask & PARTIAL_RIGHT_FLAG) {
    var partialsRight = partials,
        holdersRight = holders;

    partials = holders = undefined;
  }
  var data = isBindKey ? undefined : getData(func);

  var newData = [
    func, bitmask, thisArg, partials, holders, partialsRight, holdersRight,
    argPos, ary, arity
  ];

  if (data) {
    mergeData(newData, data);
  }
  func = newData[0];
  bitmask = newData[1];
  thisArg = newData[2];
  partials = newData[3];
  holders = newData[4];
  arity = newData[9] = newData[9] == null
    ? (isBindKey ? 0 : func.length)
    : nativeMax(newData[9] - length, 0);

  if (!arity && bitmask & (CURRY_FLAG | CURRY_RIGHT_FLAG)) {
    bitmask &= ~(CURRY_FLAG | CURRY_RIGHT_FLAG);
  }
  if (!bitmask || bitmask == BIND_FLAG) {
    var result = createBaseWrapper(func, bitmask, thisArg);
  } else if (bitmask == CURRY_FLAG || bitmask == CURRY_RIGHT_FLAG) {
    result = createCurryWrapper(func, bitmask, arity);
  } else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !holders.length) {
    result = createPartialWrapper(func, bitmask, thisArg, partials);
  } else {
    result = createHybridWrapper.apply(undefined, newData);
  }
  var setter = data ? baseSetData : setData;
  return setter(result, newData);
}

module.exports = createWrapper;

},{"./_baseSetData":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseSetData.js","./_createBaseWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createBaseWrapper.js","./_createCurryWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createCurryWrapper.js","./_createHybridWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createHybridWrapper.js","./_createPartialWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createPartialWrapper.js","./_getData":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getData.js","./_mergeData":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_mergeData.js","./_setData":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_setData.js","./toInteger":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/toInteger.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_equalArrays.js":[function(require,module,exports){
var SetCache = require('./_SetCache'),
    arraySome = require('./_arraySome');

/** Used to compose bitmasks for comparison styles. */
var UNORDERED_COMPARE_FLAG = 1,
    PARTIAL_COMPARE_FLAG = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & UNORDERED_COMPARE_FLAG) ? new SetCache : undefined;

  stack.set(array, other);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!seen.has(othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
              return seen.add(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, customizer, bitmask, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  return result;
}

module.exports = equalArrays;

},{"./_SetCache":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_SetCache.js","./_arraySome":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arraySome.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_equalByTag.js":[function(require,module,exports){
var Symbol = require('./_Symbol'),
    Uint8Array = require('./_Uint8Array'),
    equalArrays = require('./_equalArrays'),
    mapToArray = require('./_mapToArray'),
    setToArray = require('./_setToArray');

/** Used to compose bitmasks for comparison styles. */
var UNORDERED_COMPARE_FLAG = 1,
    PARTIAL_COMPARE_FLAG = 2;

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
      // Coerce dates and booleans to numbers, dates to milliseconds and
      // booleans to `1` or `0` treating invalid dates coerced to `NaN` as
      // not equal.
      return +object == +other;

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case numberTag:
      // Treat `NaN` vs. `NaN` as equal.
      return (object != +object) ? other != +other : object == +other;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/6.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= UNORDERED_COMPARE_FLAG;
      stack.set(object, other);

      // Recursively compare objects (susceptible to call stack limits).
      return equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

module.exports = equalByTag;

},{"./_Symbol":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Symbol.js","./_Uint8Array":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Uint8Array.js","./_equalArrays":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_equalArrays.js","./_mapToArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_mapToArray.js","./_setToArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_setToArray.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_equalObjects.js":[function(require,module,exports){
var baseHas = require('./_baseHas'),
    keys = require('./keys');

/** Used to compose bitmasks for comparison styles. */
var PARTIAL_COMPARE_FLAG = 2;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      objProps = keys(object),
      objLength = objProps.length,
      othProps = keys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : baseHas(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  return result;
}

module.exports = equalObjects;

},{"./_baseHas":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseHas.js","./keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/keys.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_escapeHtmlChar.js":[function(require,module,exports){
/** Used to map characters to HTML entities. */
var htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;'
};

/**
 * Used by `_.escape` to convert characters to HTML entities.
 *
 * @private
 * @param {string} chr The matched character to escape.
 * @returns {string} Returns the escaped character.
 */
function escapeHtmlChar(chr) {
  return htmlEscapes[chr];
}

module.exports = escapeHtmlChar;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getAllKeysIn.js":[function(require,module,exports){
var baseGetAllKeys = require('./_baseGetAllKeys'),
    getSymbolsIn = require('./_getSymbolsIn'),
    keysIn = require('./keysIn');

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn);
}

module.exports = getAllKeysIn;

},{"./_baseGetAllKeys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseGetAllKeys.js","./_getSymbolsIn":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getSymbolsIn.js","./keysIn":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/keysIn.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getData.js":[function(require,module,exports){
var metaMap = require('./_metaMap'),
    noop = require('./noop');

/**
 * Gets metadata for `func`.
 *
 * @private
 * @param {Function} func The function to query.
 * @returns {*} Returns the metadata for `func`.
 */
var getData = !metaMap ? noop : function(func) {
  return metaMap.get(func);
};

module.exports = getData;

},{"./_metaMap":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_metaMap.js","./noop":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/noop.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getFuncName.js":[function(require,module,exports){
var realNames = require('./_realNames');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the name of `func`.
 *
 * @private
 * @param {Function} func The function to query.
 * @returns {string} Returns the function name.
 */
function getFuncName(func) {
  var result = (func.name + ''),
      array = realNames[result],
      length = hasOwnProperty.call(realNames, result) ? array.length : 0;

  while (length--) {
    var data = array[length],
        otherFunc = data.func;
    if (otherFunc == null || otherFunc == func) {
      return data.name;
    }
  }
  return result;
}

module.exports = getFuncName;

},{"./_realNames":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_realNames.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getHolder.js":[function(require,module,exports){
/**
 * Gets the argument placeholder value for `func`.
 *
 * @private
 * @param {Function} func The function to inspect.
 * @returns {*} Returns the placeholder value.
 */
function getHolder(func) {
  var object = func;
  return object.placeholder;
}

module.exports = getHolder;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getLength.js":[function(require,module,exports){
var baseProperty = require('./_baseProperty');

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a
 * [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792) that affects
 * Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

module.exports = getLength;

},{"./_baseProperty":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseProperty.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getMapData.js":[function(require,module,exports){
var isKeyable = require('./_isKeyable');

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

module.exports = getMapData;

},{"./_isKeyable":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isKeyable.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getMatchData.js":[function(require,module,exports){
var isStrictComparable = require('./_isStrictComparable'),
    keys = require('./keys');

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = keys(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}

module.exports = getMatchData;

},{"./_isStrictComparable":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isStrictComparable.js","./keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/keys.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getNative.js":[function(require,module,exports){
var baseIsNative = require('./_baseIsNative'),
    getValue = require('./_getValue');

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;

},{"./_baseIsNative":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIsNative.js","./_getValue":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getValue.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getPrototype.js":[function(require,module,exports){
/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetPrototype = Object.getPrototypeOf;

/**
 * Gets the `[[Prototype]]` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {null|Object} Returns the `[[Prototype]]`.
 */
function getPrototype(value) {
  return nativeGetPrototype(Object(value));
}

module.exports = getPrototype;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getSymbols.js":[function(require,module,exports){
var stubArray = require('./stubArray');

/** Built-in value references. */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbol properties of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
function getSymbols(object) {
  // Coerce `object` to an object to avoid non-object errors in V8.
  // See https://bugs.chromium.org/p/v8/issues/detail?id=3443 for more details.
  return getOwnPropertySymbols(Object(object));
}

// Fallback for IE < 11.
if (!getOwnPropertySymbols) {
  getSymbols = stubArray;
}

module.exports = getSymbols;

},{"./stubArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/stubArray.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getSymbolsIn.js":[function(require,module,exports){
var arrayPush = require('./_arrayPush'),
    getPrototype = require('./_getPrototype'),
    getSymbols = require('./_getSymbols');

/** Built-in value references. */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbol properties
 * of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !getOwnPropertySymbols ? getSymbols : function(object) {
  var result = [];
  while (object) {
    arrayPush(result, getSymbols(object));
    object = getPrototype(object);
  }
  return result;
};

module.exports = getSymbolsIn;

},{"./_arrayPush":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayPush.js","./_getPrototype":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getPrototype.js","./_getSymbols":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getSymbols.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getTag.js":[function(require,module,exports){
var DataView = require('./_DataView'),
    Map = require('./_Map'),
    Promise = require('./_Promise'),
    Set = require('./_Set'),
    WeakMap = require('./_WeakMap'),
    toSource = require('./_toSource');

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';

var dataViewTag = '[object DataView]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function getTag(value) {
  return objectToString.call(value);
}

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

module.exports = getTag;

},{"./_DataView":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_DataView.js","./_Map":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Map.js","./_Promise":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Promise.js","./_Set":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Set.js","./_WeakMap":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_WeakMap.js","./_toSource":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_toSource.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getValue.js":[function(require,module,exports){
/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_hasPath.js":[function(require,module,exports){
var castPath = require('./_castPath'),
    isArguments = require('./isArguments'),
    isArray = require('./isArray'),
    isIndex = require('./_isIndex'),
    isKey = require('./_isKey'),
    isLength = require('./isLength'),
    isString = require('./isString'),
    toKey = require('./_toKey');

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = isKey(path, object) ? [path] : castPath(path);

  var result,
      index = -1,
      length = path.length;

  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result) {
    return result;
  }
  var length = object ? object.length : 0;
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray(object) || isString(object) || isArguments(object));
}

module.exports = hasPath;

},{"./_castPath":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_castPath.js","./_isIndex":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isIndex.js","./_isKey":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isKey.js","./_toKey":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_toKey.js","./isArguments":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArguments.js","./isArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArray.js","./isLength":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isLength.js","./isString":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isString.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_hashClear.js":[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

module.exports = hashClear;

},{"./_nativeCreate":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_nativeCreate.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_hashDelete.js":[function(require,module,exports){
/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

module.exports = hashDelete;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_hashGet.js":[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;

},{"./_nativeCreate":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_nativeCreate.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_hashHas.js":[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

module.exports = hashHas;

},{"./_nativeCreate":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_nativeCreate.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_hashSet.js":[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;

},{"./_nativeCreate":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_nativeCreate.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_indexKeys.js":[function(require,module,exports){
var baseTimes = require('./_baseTimes'),
    isArguments = require('./isArguments'),
    isArray = require('./isArray'),
    isLength = require('./isLength'),
    isString = require('./isString');

/**
 * Creates an array of index keys for `object` values of arrays,
 * `arguments` objects, and strings, otherwise `null` is returned.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array|null} Returns index keys, else `null`.
 */
function indexKeys(object) {
  var length = object ? object.length : undefined;
  if (isLength(length) &&
      (isArray(object) || isString(object) || isArguments(object))) {
    return baseTimes(length, String);
  }
  return null;
}

module.exports = indexKeys;

},{"./_baseTimes":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseTimes.js","./isArguments":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArguments.js","./isArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArray.js","./isLength":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isLength.js","./isString":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isString.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_indexOfNaN.js":[function(require,module,exports){
/**
 * Gets the index at which the first occurrence of `NaN` is found in `array`.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched `NaN`, else `-1`.
 */
function indexOfNaN(array, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    var other = array[index];
    if (other !== other) {
      return index;
    }
  }
  return -1;
}

module.exports = indexOfNaN;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isFlattenable.js":[function(require,module,exports){
var isArguments = require('./isArguments'),
    isArray = require('./isArray');

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable(value) {
  return isArray(value) || isArguments(value);
}

module.exports = isFlattenable;

},{"./isArguments":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArguments.js","./isArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArray.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isHostObject.js":[function(require,module,exports){
/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

module.exports = isHostObject;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isIndex.js":[function(require,module,exports){
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isIterateeCall.js":[function(require,module,exports){
var eq = require('./eq'),
    isArrayLike = require('./isArrayLike'),
    isIndex = require('./_isIndex'),
    isObject = require('./isObject');

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

module.exports = isIterateeCall;

},{"./_isIndex":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isIndex.js","./eq":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/eq.js","./isArrayLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArrayLike.js","./isObject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObject.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isKey.js":[function(require,module,exports){
var isArray = require('./isArray'),
    isSymbol = require('./isSymbol');

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

module.exports = isKey;

},{"./isArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArray.js","./isSymbol":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isSymbol.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isKeyable.js":[function(require,module,exports){
/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

module.exports = isKeyable;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isLaziable.js":[function(require,module,exports){
var LazyWrapper = require('./_LazyWrapper'),
    getData = require('./_getData'),
    getFuncName = require('./_getFuncName'),
    lodash = require('./wrapperLodash');

/**
 * Checks if `func` has a lazy counterpart.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` has a lazy counterpart,
 *  else `false`.
 */
function isLaziable(func) {
  var funcName = getFuncName(func),
      other = lodash[funcName];

  if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
    return false;
  }
  if (func === other) {
    return true;
  }
  var data = getData(other);
  return !!data && func === data[0];
}

module.exports = isLaziable;

},{"./_LazyWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_LazyWrapper.js","./_getData":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getData.js","./_getFuncName":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getFuncName.js","./wrapperLodash":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/wrapperLodash.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isMasked.js":[function(require,module,exports){
var coreJsData = require('./_coreJsData');

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;

},{"./_coreJsData":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_coreJsData.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isPrototype.js":[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isStrictComparable.js":[function(require,module,exports){
var isObject = require('./isObject');

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject(value);
}

module.exports = isStrictComparable;

},{"./isObject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObject.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_iteratorToArray.js":[function(require,module,exports){
/**
 * Converts `iterator` to an array.
 *
 * @private
 * @param {Object} iterator The iterator to convert.
 * @returns {Array} Returns the converted array.
 */
function iteratorToArray(iterator) {
  var data,
      result = [];

  while (!(data = iterator.next()).done) {
    result.push(data.value);
  }
  return result;
}

module.exports = iteratorToArray;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_listCacheClear.js":[function(require,module,exports){
/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

module.exports = listCacheClear;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_listCacheDelete.js":[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

module.exports = listCacheDelete;

},{"./_assocIndexOf":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_assocIndexOf.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_listCacheGet.js":[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;

},{"./_assocIndexOf":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_assocIndexOf.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_listCacheHas.js":[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;

},{"./_assocIndexOf":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_assocIndexOf.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_listCacheSet.js":[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

module.exports = listCacheSet;

},{"./_assocIndexOf":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_assocIndexOf.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_mapCacheClear.js":[function(require,module,exports){
var Hash = require('./_Hash'),
    ListCache = require('./_ListCache'),
    Map = require('./_Map');

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

module.exports = mapCacheClear;

},{"./_Hash":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Hash.js","./_ListCache":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_ListCache.js","./_Map":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_Map.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_mapCacheDelete.js":[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

module.exports = mapCacheDelete;

},{"./_getMapData":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getMapData.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_mapCacheGet.js":[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;

},{"./_getMapData":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getMapData.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_mapCacheHas.js":[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;

},{"./_getMapData":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getMapData.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_mapCacheSet.js":[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

module.exports = mapCacheSet;

},{"./_getMapData":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getMapData.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_mapToArray.js":[function(require,module,exports){
/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

module.exports = mapToArray;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_matchesStrictComparable.js":[function(require,module,exports){
/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

module.exports = matchesStrictComparable;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_mergeData.js":[function(require,module,exports){
var composeArgs = require('./_composeArgs'),
    composeArgsRight = require('./_composeArgsRight'),
    replaceHolders = require('./_replaceHolders');

/** Used as the internal argument placeholder. */
var PLACEHOLDER = '__lodash_placeholder__';

/** Used to compose bitmasks for wrapper metadata. */
var BIND_FLAG = 1,
    BIND_KEY_FLAG = 2,
    CURRY_BOUND_FLAG = 4,
    CURRY_FLAG = 8,
    ARY_FLAG = 128,
    REARG_FLAG = 256;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMin = Math.min;

/**
 * Merges the function metadata of `source` into `data`.
 *
 * Merging metadata reduces the number of wrappers used to invoke a function.
 * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
 * may be applied regardless of execution order. Methods like `_.ary` and
 * `_.rearg` modify function arguments, making the order in which they are
 * executed important, preventing the merging of metadata. However, we make
 * an exception for a safe combined case where curried functions have `_.ary`
 * and or `_.rearg` applied.
 *
 * @private
 * @param {Array} data The destination metadata.
 * @param {Array} source The source metadata.
 * @returns {Array} Returns `data`.
 */
function mergeData(data, source) {
  var bitmask = data[1],
      srcBitmask = source[1],
      newBitmask = bitmask | srcBitmask,
      isCommon = newBitmask < (BIND_FLAG | BIND_KEY_FLAG | ARY_FLAG);

  var isCombo =
    ((srcBitmask == ARY_FLAG) && (bitmask == CURRY_FLAG)) ||
    ((srcBitmask == ARY_FLAG) && (bitmask == REARG_FLAG) && (data[7].length <= source[8])) ||
    ((srcBitmask == (ARY_FLAG | REARG_FLAG)) && (source[7].length <= source[8]) && (bitmask == CURRY_FLAG));

  // Exit early if metadata can't be merged.
  if (!(isCommon || isCombo)) {
    return data;
  }
  // Use source `thisArg` if available.
  if (srcBitmask & BIND_FLAG) {
    data[2] = source[2];
    // Set when currying a bound function.
    newBitmask |= bitmask & BIND_FLAG ? 0 : CURRY_BOUND_FLAG;
  }
  // Compose partial arguments.
  var value = source[3];
  if (value) {
    var partials = data[3];
    data[3] = partials ? composeArgs(partials, value, source[4]) : value;
    data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
  }
  // Compose partial right arguments.
  value = source[5];
  if (value) {
    partials = data[5];
    data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
    data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
  }
  // Use source `argPos` if available.
  value = source[7];
  if (value) {
    data[7] = value;
  }
  // Use source `ary` if it's smaller.
  if (srcBitmask & ARY_FLAG) {
    data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
  }
  // Use source `arity` if one is not provided.
  if (data[9] == null) {
    data[9] = source[9];
  }
  // Use source `func` and merge bitmasks.
  data[0] = source[0];
  data[1] = newBitmask;

  return data;
}

module.exports = mergeData;

},{"./_composeArgs":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_composeArgs.js","./_composeArgsRight":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_composeArgsRight.js","./_replaceHolders":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_replaceHolders.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_metaMap.js":[function(require,module,exports){
var WeakMap = require('./_WeakMap');

/** Used to store function metadata. */
var metaMap = WeakMap && new WeakMap;

module.exports = metaMap;

},{"./_WeakMap":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_WeakMap.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_nativeCreate.js":[function(require,module,exports){
var getNative = require('./_getNative');

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;

},{"./_getNative":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getNative.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_parent.js":[function(require,module,exports){
var baseGet = require('./_baseGet'),
    baseSlice = require('./_baseSlice');

/**
 * Gets the parent value at `path` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} path The path to get the parent value of.
 * @returns {*} Returns the parent value.
 */
function parent(object, path) {
  return path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
}

module.exports = parent;

},{"./_baseGet":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseGet.js","./_baseSlice":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseSlice.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_realNames.js":[function(require,module,exports){
/** Used to lookup unminified function names. */
var realNames = {};

module.exports = realNames;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_reorder.js":[function(require,module,exports){
var copyArray = require('./_copyArray'),
    isIndex = require('./_isIndex');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMin = Math.min;

/**
 * Reorder `array` according to the specified indexes where the element at
 * the first index is assigned as the first element, the element at
 * the second index is assigned as the second element, and so on.
 *
 * @private
 * @param {Array} array The array to reorder.
 * @param {Array} indexes The arranged array indexes.
 * @returns {Array} Returns `array`.
 */
function reorder(array, indexes) {
  var arrLength = array.length,
      length = nativeMin(indexes.length, arrLength),
      oldArray = copyArray(array);

  while (length--) {
    var index = indexes[length];
    array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
  }
  return array;
}

module.exports = reorder;

},{"./_copyArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_copyArray.js","./_isIndex":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isIndex.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_replaceHolders.js":[function(require,module,exports){
/** Used as the internal argument placeholder. */
var PLACEHOLDER = '__lodash_placeholder__';

/**
 * Replaces all `placeholder` elements in `array` with an internal placeholder
 * and returns an array of their indexes.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {*} placeholder The placeholder to replace.
 * @returns {Array} Returns the new array of placeholder indexes.
 */
function replaceHolders(array, placeholder) {
  var index = -1,
      length = array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (value === placeholder || value === PLACEHOLDER) {
      array[index] = PLACEHOLDER;
      result[resIndex++] = index;
    }
  }
  return result;
}

module.exports = replaceHolders;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_root.js":[function(require,module,exports){
(function (global){
var checkGlobal = require('./_checkGlobal');

/** Detect free variable `global` from Node.js. */
var freeGlobal = checkGlobal(typeof global == 'object' && global);

/** Detect free variable `self`. */
var freeSelf = checkGlobal(typeof self == 'object' && self);

/** Detect `this` as the global object. */
var thisGlobal = checkGlobal(typeof this == 'object' && this);

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || thisGlobal || Function('return this')();

module.exports = root;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_checkGlobal":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_checkGlobal.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_setCacheAdd.js":[function(require,module,exports){
/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

module.exports = setCacheAdd;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_setCacheHas.js":[function(require,module,exports){
/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

module.exports = setCacheHas;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_setData.js":[function(require,module,exports){
var baseSetData = require('./_baseSetData'),
    now = require('./now');

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 150,
    HOT_SPAN = 16;

/**
 * Sets metadata for `func`.
 *
 * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
 * period of time, it will trip its breaker and transition to an identity
 * function to avoid garbage collection pauses in V8. See
 * [V8 issue 2070](https://bugs.chromium.org/p/v8/issues/detail?id=2070)
 * for more details.
 *
 * @private
 * @param {Function} func The function to associate metadata with.
 * @param {*} data The metadata.
 * @returns {Function} Returns `func`.
 */
var setData = (function() {
  var count = 0,
      lastCalled = 0;

  return function(key, value) {
    var stamp = now(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return key;
      }
    } else {
      count = 0;
    }
    return baseSetData(key, value);
  };
}());

module.exports = setData;

},{"./_baseSetData":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseSetData.js","./now":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/now.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_setToArray.js":[function(require,module,exports){
/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

module.exports = setToArray;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_stackClear.js":[function(require,module,exports){
var ListCache = require('./_ListCache');

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
}

module.exports = stackClear;

},{"./_ListCache":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_ListCache.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_stackDelete.js":[function(require,module,exports){
/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

module.exports = stackDelete;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_stackGet.js":[function(require,module,exports){
/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

module.exports = stackGet;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_stackHas.js":[function(require,module,exports){
/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

module.exports = stackHas;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_stackSet.js":[function(require,module,exports){
var ListCache = require('./_ListCache'),
    MapCache = require('./_MapCache');

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache && cache.__data__.length == LARGE_ARRAY_SIZE) {
    cache = this.__data__ = new MapCache(cache.__data__);
  }
  cache.set(key, value);
  return this;
}

module.exports = stackSet;

},{"./_ListCache":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_ListCache.js","./_MapCache":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_MapCache.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_stringToPath.js":[function(require,module,exports){
var memoize = require('./memoize'),
    toString = require('./toString');

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(\.|\[\])(?:\4|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoize(function(string) {
  var result = [];
  toString(string).replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

module.exports = stringToPath;

},{"./memoize":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/memoize.js","./toString":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/toString.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_toKey.js":[function(require,module,exports){
var isSymbol = require('./isSymbol');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = toKey;

},{"./isSymbol":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isSymbol.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_toSource.js":[function(require,module,exports){
/** Used to resolve the decompiled source of functions. */
var funcToString = Function.prototype.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_wrapperClone.js":[function(require,module,exports){
var LazyWrapper = require('./_LazyWrapper'),
    LodashWrapper = require('./_LodashWrapper'),
    copyArray = require('./_copyArray');

/**
 * Creates a clone of `wrapper`.
 *
 * @private
 * @param {Object} wrapper The wrapper to clone.
 * @returns {Object} Returns the cloned wrapper.
 */
function wrapperClone(wrapper) {
  if (wrapper instanceof LazyWrapper) {
    return wrapper.clone();
  }
  var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
  result.__actions__ = copyArray(wrapper.__actions__);
  result.__index__  = wrapper.__index__;
  result.__values__ = wrapper.__values__;
  return result;
}

module.exports = wrapperClone;

},{"./_LazyWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_LazyWrapper.js","./_LodashWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_LodashWrapper.js","./_copyArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_copyArray.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/assign.js":[function(require,module,exports){
var assignValue = require('./_assignValue'),
    copyObject = require('./_copyObject'),
    createAssigner = require('./_createAssigner'),
    isArrayLike = require('./isArrayLike'),
    isPrototype = require('./_isPrototype'),
    keys = require('./keys');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/** Detect if properties shadowing those on `Object.prototype` are non-enumerable. */
var nonEnumShadows = !propertyIsEnumerable.call({ 'valueOf': 1 }, 'valueOf');

/**
 * Assigns own enumerable string keyed properties of source objects to the
 * destination object. Source objects are applied from left to right.
 * Subsequent sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object` and is loosely based on
 * [`Object.assign`](https://mdn.io/Object/assign).
 *
 * @static
 * @memberOf _
 * @since 0.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.assignIn
 * @example
 *
 * function Foo() {
 *   this.c = 3;
 * }
 *
 * function Bar() {
 *   this.e = 5;
 * }
 *
 * Foo.prototype.d = 4;
 * Bar.prototype.f = 6;
 *
 * _.assign({ 'a': 1 }, new Foo, new Bar);
 * // => { 'a': 1, 'c': 3, 'e': 5 }
 */
var assign = createAssigner(function(object, source) {
  if (nonEnumShadows || isPrototype(source) || isArrayLike(source)) {
    copyObject(source, keys(source), object);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty.call(source, key)) {
      assignValue(object, key, source[key]);
    }
  }
});

module.exports = assign;

},{"./_assignValue":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_assignValue.js","./_copyObject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_copyObject.js","./_createAssigner":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createAssigner.js","./_isPrototype":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isPrototype.js","./isArrayLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArrayLike.js","./keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/keys.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/before.js":[function(require,module,exports){
var toInteger = require('./toInteger');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that invokes `func`, with the `this` binding and arguments
 * of the created function, while it's called less than `n` times. Subsequent
 * calls to the created function return the result of the last `func` invocation.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Function
 * @param {number} n The number of calls at which `func` is no longer invoked.
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * jQuery(element).on('click', _.before(5, addContactToList));
 * // => allows adding up to 4 contacts to the list
 */
function before(n, func) {
  var result;
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  n = toInteger(n);
  return function() {
    if (--n > 0) {
      result = func.apply(this, arguments);
    }
    if (n <= 1) {
      func = undefined;
    }
    return result;
  };
}

module.exports = before;

},{"./toInteger":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/toInteger.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/bind.js":[function(require,module,exports){
var createWrapper = require('./_createWrapper'),
    getHolder = require('./_getHolder'),
    replaceHolders = require('./_replaceHolders'),
    rest = require('./rest');

/** Used to compose bitmasks for wrapper metadata. */
var BIND_FLAG = 1,
    PARTIAL_FLAG = 32;

/**
 * Creates a function that invokes `func` with the `this` binding of `thisArg`
 * and `partials` prepended to the arguments it receives.
 *
 * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
 * may be used as a placeholder for partially applied arguments.
 *
 * **Note:** Unlike native `Function#bind`, this method doesn't set the "length"
 * property of bound functions.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to bind.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {...*} [partials] The arguments to be partially applied.
 * @returns {Function} Returns the new bound function.
 * @example
 *
 * var greet = function(greeting, punctuation) {
 *   return greeting + ' ' + this.user + punctuation;
 * };
 *
 * var object = { 'user': 'fred' };
 *
 * var bound = _.bind(greet, object, 'hi');
 * bound('!');
 * // => 'hi fred!'
 *
 * // Bound with placeholders.
 * var bound = _.bind(greet, object, _, '!');
 * bound('hi');
 * // => 'hi fred!'
 */
var bind = rest(function(func, thisArg, partials) {
  var bitmask = BIND_FLAG;
  if (partials.length) {
    var holders = replaceHolders(partials, getHolder(bind));
    bitmask |= PARTIAL_FLAG;
  }
  return createWrapper(func, bitmask, thisArg, partials, holders);
});

// Assign default placeholders.
bind.placeholder = {};

module.exports = bind;

},{"./_createWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createWrapper.js","./_getHolder":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getHolder.js","./_replaceHolders":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_replaceHolders.js","./rest":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/rest.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/difference.js":[function(require,module,exports){
var baseDifference = require('./_baseDifference'),
    baseFlatten = require('./_baseFlatten'),
    isArrayLikeObject = require('./isArrayLikeObject'),
    rest = require('./rest');

/**
 * Creates an array of unique `array` values not included in the other given
 * arrays using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * for equality comparisons. The order of result values is determined by the
 * order they occur in the first array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {...Array} [values] The values to exclude.
 * @returns {Array} Returns the new array of filtered values.
 * @see _.without, _.xor
 * @example
 *
 * _.difference([2, 1], [2, 3]);
 * // => [1]
 */
var difference = rest(function(array, values) {
  return isArrayLikeObject(array)
    ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true))
    : [];
});

module.exports = difference;

},{"./_baseDifference":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseDifference.js","./_baseFlatten":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseFlatten.js","./isArrayLikeObject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArrayLikeObject.js","./rest":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/rest.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/eq.js":[function(require,module,exports){
/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'user': 'fred' };
 * var other = { 'user': 'fred' };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/escape.js":[function(require,module,exports){
var escapeHtmlChar = require('./_escapeHtmlChar'),
    toString = require('./toString');

/** Used to match HTML entities and HTML characters. */
var reUnescapedHtml = /[&<>"'`]/g,
    reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

/**
 * Converts the characters "&", "<", ">", '"', "'", and "\`" in `string` to
 * their corresponding HTML entities.
 *
 * **Note:** No other characters are escaped. To escape additional
 * characters use a third-party library like [_he_](https://mths.be/he).
 *
 * Though the ">" character is escaped for symmetry, characters like
 * ">" and "/" don't need escaping in HTML and have no special meaning
 * unless they're part of a tag or unquoted attribute value. See
 * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
 * (under "semi-related fun fact") for more details.
 *
 * Backticks are escaped because in IE < 9, they can break out of
 * attribute values or HTML comments. See [#59](https://html5sec.org/#59),
 * [#102](https://html5sec.org/#102), [#108](https://html5sec.org/#108), and
 * [#133](https://html5sec.org/#133) of the
 * [HTML5 Security Cheatsheet](https://html5sec.org/) for more details.
 *
 * When working with HTML you should always
 * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
 * XSS vectors.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escape('fred, barney, & pebbles');
 * // => 'fred, barney, &amp; pebbles'
 */
function escape(string) {
  string = toString(string);
  return (string && reHasUnescapedHtml.test(string))
    ? string.replace(reUnescapedHtml, escapeHtmlChar)
    : string;
}

module.exports = escape;

},{"./_escapeHtmlChar":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_escapeHtmlChar.js","./toString":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/toString.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/find.js":[function(require,module,exports){
var createFind = require('./_createFind'),
    findIndex = require('./findIndex');

/**
 * Iterates over elements of `collection`, returning the first element
 * `predicate` returns truthy for. The predicate is invoked with three
 * arguments: (value, index|key, collection).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to search.
 * @param {Array|Function|Object|string} [predicate=_.identity]
 *  The function invoked per iteration.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {*} Returns the matched element, else `undefined`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'age': 36, 'active': true },
 *   { 'user': 'fred',    'age': 40, 'active': false },
 *   { 'user': 'pebbles', 'age': 1,  'active': true }
 * ];
 *
 * _.find(users, function(o) { return o.age < 40; });
 * // => object for 'barney'
 *
 * // The `_.matches` iteratee shorthand.
 * _.find(users, { 'age': 1, 'active': true });
 * // => object for 'pebbles'
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.find(users, ['active', false]);
 * // => object for 'fred'
 *
 * // The `_.property` iteratee shorthand.
 * _.find(users, 'active');
 * // => object for 'barney'
 */
var find = createFind(findIndex);

module.exports = find;

},{"./_createFind":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_createFind.js","./findIndex":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/findIndex.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/findIndex.js":[function(require,module,exports){
var baseFindIndex = require('./_baseFindIndex'),
    baseIteratee = require('./_baseIteratee'),
    toInteger = require('./toInteger');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * This method is like `_.find` except that it returns the index of the first
 * element `predicate` returns truthy for instead of the element itself.
 *
 * @static
 * @memberOf _
 * @since 1.1.0
 * @category Array
 * @param {Array} array The array to search.
 * @param {Array|Function|Object|string} [predicate=_.identity]
 *  The function invoked per iteration.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {number} Returns the index of the found element, else `-1`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'active': false },
 *   { 'user': 'fred',    'active': false },
 *   { 'user': 'pebbles', 'active': true }
 * ];
 *
 * _.findIndex(users, function(o) { return o.user == 'barney'; });
 * // => 0
 *
 * // The `_.matches` iteratee shorthand.
 * _.findIndex(users, { 'user': 'fred', 'active': false });
 * // => 1
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.findIndex(users, ['active', false]);
 * // => 0
 *
 * // The `_.property` iteratee shorthand.
 * _.findIndex(users, 'active');
 * // => 2
 */
function findIndex(array, predicate, fromIndex) {
  var length = array ? array.length : 0;
  if (!length) {
    return -1;
  }
  var index = fromIndex == null ? 0 : toInteger(fromIndex);
  if (index < 0) {
    index = nativeMax(length + index, 0);
  }
  return baseFindIndex(array, baseIteratee(predicate, 3), index);
}

module.exports = findIndex;

},{"./_baseFindIndex":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseFindIndex.js","./_baseIteratee":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIteratee.js","./toInteger":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/toInteger.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/flatten.js":[function(require,module,exports){
var baseFlatten = require('./_baseFlatten');

/**
 * Flattens `array` a single level deep.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * _.flatten([1, [2, [3, [4]], 5]]);
 * // => [1, 2, [3, [4]], 5]
 */
function flatten(array) {
  var length = array ? array.length : 0;
  return length ? baseFlatten(array, 1) : [];
}

module.exports = flatten;

},{"./_baseFlatten":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseFlatten.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/forEach.js":[function(require,module,exports){
var arrayEach = require('./_arrayEach'),
    baseEach = require('./_baseEach'),
    baseIteratee = require('./_baseIteratee'),
    isArray = require('./isArray');

/**
 * Iterates over elements of `collection` and invokes `iteratee` for each element.
 * The iteratee is invoked with three arguments: (value, index|key, collection).
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a "length"
 * property are iterated like arrays. To avoid this behavior use `_.forIn`
 * or `_.forOwn` for object iteration.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @alias each
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 * @see _.forEachRight
 * @example
 *
 * _([1, 2]).forEach(function(value) {
 *   console.log(value);
 * });
 * // => Logs `1` then `2`.
 *
 * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
 *   console.log(key);
 * });
 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
 */
function forEach(collection, iteratee) {
  var func = isArray(collection) ? arrayEach : baseEach;
  return func(collection, baseIteratee(iteratee, 3));
}

module.exports = forEach;

},{"./_arrayEach":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayEach.js","./_baseEach":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseEach.js","./_baseIteratee":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIteratee.js","./isArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArray.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/forOwn.js":[function(require,module,exports){
var baseForOwn = require('./_baseForOwn'),
    baseIteratee = require('./_baseIteratee');

/**
 * Iterates over own enumerable string keyed properties of an object and
 * invokes `iteratee` for each property. The iteratee is invoked with three
 * arguments: (value, key, object). Iteratee functions may exit iteration
 * early by explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @since 0.3.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Object} Returns `object`.
 * @see _.forOwnRight
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.forOwn(new Foo, function(value, key) {
 *   console.log(key);
 * });
 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
 */
function forOwn(object, iteratee) {
  return object && baseForOwn(object, baseIteratee(iteratee, 3));
}

module.exports = forOwn;

},{"./_baseForOwn":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseForOwn.js","./_baseIteratee":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIteratee.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/get.js":[function(require,module,exports){
var baseGet = require('./_baseGet');

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is used in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

module.exports = get;

},{"./_baseGet":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseGet.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/has.js":[function(require,module,exports){
var baseHas = require('./_baseHas'),
    hasPath = require('./_hasPath');

/**
 * Checks if `path` is a direct property of `object`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = { 'a': { 'b': 2 } };
 * var other = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.has(object, 'a');
 * // => true
 *
 * _.has(object, 'a.b');
 * // => true
 *
 * _.has(object, ['a', 'b']);
 * // => true
 *
 * _.has(other, 'a');
 * // => false
 */
function has(object, path) {
  return object != null && hasPath(object, path, baseHas);
}

module.exports = has;

},{"./_baseHas":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseHas.js","./_hasPath":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_hasPath.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/hasIn.js":[function(require,module,exports){
var baseHasIn = require('./_baseHasIn'),
    hasPath = require('./_hasPath');

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

module.exports = hasIn;

},{"./_baseHasIn":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseHasIn.js","./_hasPath":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_hasPath.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/identity.js":[function(require,module,exports){
/**
 * This method returns the first argument given to it.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/includes.js":[function(require,module,exports){
var baseIndexOf = require('./_baseIndexOf'),
    isArrayLike = require('./isArrayLike'),
    isString = require('./isString'),
    toInteger = require('./toInteger'),
    values = require('./values');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Checks if `value` is in `collection`. If `collection` is a string, it's
 * checked for a substring of `value`, otherwise
 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * is used for equality comparisons. If `fromIndex` is negative, it's used as
 * the offset from the end of `collection`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object|string} collection The collection to search.
 * @param {*} value The value to search for.
 * @param {number} [fromIndex=0] The index to search from.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
 * @returns {boolean} Returns `true` if `value` is found, else `false`.
 * @example
 *
 * _.includes([1, 2, 3], 1);
 * // => true
 *
 * _.includes([1, 2, 3], 1, 2);
 * // => false
 *
 * _.includes({ 'user': 'fred', 'age': 40 }, 'fred');
 * // => true
 *
 * _.includes('pebbles', 'eb');
 * // => true
 */
function includes(collection, value, fromIndex, guard) {
  collection = isArrayLike(collection) ? collection : values(collection);
  fromIndex = (fromIndex && !guard) ? toInteger(fromIndex) : 0;

  var length = collection.length;
  if (fromIndex < 0) {
    fromIndex = nativeMax(length + fromIndex, 0);
  }
  return isString(collection)
    ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
    : (!!length && baseIndexOf(collection, value, fromIndex) > -1);
}

module.exports = includes;

},{"./_baseIndexOf":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIndexOf.js","./isArrayLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArrayLike.js","./isString":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isString.js","./toInteger":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/toInteger.js","./values":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/values.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/invokeMap.js":[function(require,module,exports){
var apply = require('./_apply'),
    baseEach = require('./_baseEach'),
    baseInvoke = require('./_baseInvoke'),
    isArrayLike = require('./isArrayLike'),
    isKey = require('./_isKey'),
    rest = require('./rest');

/**
 * Invokes the method at `path` of each element in `collection`, returning
 * an array of the results of each invoked method. Any additional arguments
 * are provided to each invoked method. If `methodName` is a function, it's
 * invoked for and `this` bound to, each element in `collection`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Array|Function|string} path The path of the method to invoke or
 *  the function invoked per iteration.
 * @param {...*} [args] The arguments to invoke each method with.
 * @returns {Array} Returns the array of results.
 * @example
 *
 * _.invokeMap([[5, 1, 7], [3, 2, 1]], 'sort');
 * // => [[1, 5, 7], [1, 2, 3]]
 *
 * _.invokeMap([123, 456], String.prototype.split, '');
 * // => [['1', '2', '3'], ['4', '5', '6']]
 */
var invokeMap = rest(function(collection, path, args) {
  var index = -1,
      isFunc = typeof path == 'function',
      isProp = isKey(path),
      result = isArrayLike(collection) ? Array(collection.length) : [];

  baseEach(collection, function(value) {
    var func = isFunc ? path : ((isProp && value != null) ? value[path] : undefined);
    result[++index] = func ? apply(func, value, args) : baseInvoke(value, path, args);
  });
  return result;
});

module.exports = invokeMap;

},{"./_apply":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_apply.js","./_baseEach":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseEach.js","./_baseInvoke":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseInvoke.js","./_isKey":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isKey.js","./isArrayLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArrayLike.js","./rest":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/rest.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArguments.js":[function(require,module,exports){
var isArrayLikeObject = require('./isArrayLikeObject');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

module.exports = isArguments;

},{"./isArrayLikeObject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArrayLikeObject.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArray.js":[function(require,module,exports){
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @type {Function}
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArrayLike.js":[function(require,module,exports){
var getLength = require('./_getLength'),
    isFunction = require('./isFunction'),
    isLength = require('./isLength');

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value)) && !isFunction(value);
}

module.exports = isArrayLike;

},{"./_getLength":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getLength.js","./isFunction":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isFunction.js","./isLength":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isLength.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArrayLikeObject.js":[function(require,module,exports){
var isArrayLike = require('./isArrayLike'),
    isObjectLike = require('./isObjectLike');

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

module.exports = isArrayLikeObject;

},{"./isArrayLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArrayLike.js","./isObjectLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObjectLike.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isBuffer.js":[function(require,module,exports){
var root = require('./_root'),
    stubFalse = require('./stubFalse');

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = !Buffer ? stubFalse : function(value) {
  return value instanceof Buffer;
};

module.exports = isBuffer;

},{"./_root":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_root.js","./stubFalse":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/stubFalse.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isDate.js":[function(require,module,exports){
var isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var dateTag = '[object Date]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Date` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isDate(new Date);
 * // => true
 *
 * _.isDate('Mon April 23 2012');
 * // => false
 */
function isDate(value) {
  return isObjectLike(value) && objectToString.call(value) == dateTag;
}

module.exports = isDate;

},{"./isObjectLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObjectLike.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isEmpty.js":[function(require,module,exports){
var getTag = require('./_getTag'),
    isArguments = require('./isArguments'),
    isArray = require('./isArray'),
    isArrayLike = require('./isArrayLike'),
    isBuffer = require('./isBuffer'),
    isFunction = require('./isFunction'),
    isObjectLike = require('./isObjectLike'),
    isString = require('./isString'),
    keys = require('./keys');

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    setTag = '[object Set]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/** Detect if properties shadowing those on `Object.prototype` are non-enumerable. */
var nonEnumShadows = !propertyIsEnumerable.call({ 'valueOf': 1 }, 'valueOf');

/**
 * Checks if `value` is an empty object, collection, map, or set.
 *
 * Objects are considered empty if they have no own enumerable string keyed
 * properties.
 *
 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
 * jQuery-like collections are considered empty if they have a `length` of `0`.
 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * _.isEmpty(null);
 * // => true
 *
 * _.isEmpty(true);
 * // => true
 *
 * _.isEmpty(1);
 * // => true
 *
 * _.isEmpty([1, 2, 3]);
 * // => false
 *
 * _.isEmpty({ 'a': 1 });
 * // => false
 */
function isEmpty(value) {
  if (isArrayLike(value) &&
      (isArray(value) || isString(value) || isFunction(value.splice) ||
        isArguments(value) || isBuffer(value))) {
    return !value.length;
  }
  if (isObjectLike(value)) {
    var tag = getTag(value);
    if (tag == mapTag || tag == setTag) {
      return !value.size;
    }
  }
  for (var key in value) {
    if (hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return !(nonEnumShadows && keys(value).length);
}

module.exports = isEmpty;

},{"./_getTag":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getTag.js","./isArguments":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArguments.js","./isArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArray.js","./isArrayLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArrayLike.js","./isBuffer":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isBuffer.js","./isFunction":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isFunction.js","./isObjectLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObjectLike.js","./isString":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isString.js","./keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/keys.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isEqual.js":[function(require,module,exports){
var baseIsEqual = require('./_baseIsEqual');

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are **not** supported.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent,
 *  else `false`.
 * @example
 *
 * var object = { 'user': 'fred' };
 * var other = { 'user': 'fred' };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return baseIsEqual(value, other);
}

module.exports = isEqual;

},{"./_baseIsEqual":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseIsEqual.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isFunction.js":[function(require,module,exports){
var isObject = require('./isObject');

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array and weak map constructors,
  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

module.exports = isFunction;

},{"./isObject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObject.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isLength.js":[function(require,module,exports){
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length,
 *  else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObject.js":[function(require,module,exports){
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObjectLike.js":[function(require,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isString.js":[function(require,module,exports){
var isArray = require('./isArray'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var stringTag = '[object String]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
}

module.exports = isString;

},{"./isArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArray.js","./isObjectLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObjectLike.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isSymbol.js":[function(require,module,exports){
var isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

module.exports = isSymbol;

},{"./isObjectLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObjectLike.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isTypedArray.js":[function(require,module,exports){
var isLength = require('./isLength'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
function isTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
}

module.exports = isTypedArray;

},{"./isLength":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isLength.js","./isObjectLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObjectLike.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/keys.js":[function(require,module,exports){
var baseHas = require('./_baseHas'),
    baseKeys = require('./_baseKeys'),
    indexKeys = require('./_indexKeys'),
    isArrayLike = require('./isArrayLike'),
    isIndex = require('./_isIndex'),
    isPrototype = require('./_isPrototype');

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  var isProto = isPrototype(object);
  if (!(isProto || isArrayLike(object))) {
    return baseKeys(object);
  }
  var indexes = indexKeys(object),
      skipIndexes = !!indexes,
      result = indexes || [],
      length = result.length;

  for (var key in object) {
    if (baseHas(object, key) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length))) &&
        !(isProto && key == 'constructor')) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keys;

},{"./_baseHas":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseHas.js","./_baseKeys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseKeys.js","./_indexKeys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_indexKeys.js","./_isIndex":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isIndex.js","./_isPrototype":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isPrototype.js","./isArrayLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArrayLike.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/keysIn.js":[function(require,module,exports){
var baseKeysIn = require('./_baseKeysIn'),
    indexKeys = require('./_indexKeys'),
    isIndex = require('./_isIndex'),
    isPrototype = require('./_isPrototype');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  var index = -1,
      isProto = isPrototype(object),
      props = baseKeysIn(object),
      propsLength = props.length,
      indexes = indexKeys(object),
      skipIndexes = !!indexes,
      result = indexes || [],
      length = result.length;

  while (++index < propsLength) {
    var key = props[index];
    if (!(skipIndexes && (key == 'length' || isIndex(key, length))) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keysIn;

},{"./_baseKeysIn":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseKeysIn.js","./_indexKeys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_indexKeys.js","./_isIndex":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isIndex.js","./_isPrototype":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isPrototype.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/last.js":[function(require,module,exports){
/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array ? array.length : 0;
  return length ? array[length - 1] : undefined;
}

module.exports = last;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/memoize.js":[function(require,module,exports){
var MapCache = require('./_MapCache');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache;

module.exports = memoize;

},{"./_MapCache":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_MapCache.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/noop.js":[function(require,module,exports){
/**
 * A method that returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

module.exports = noop;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/now.js":[function(require,module,exports){
/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
function now() {
  return Date.now();
}

module.exports = now;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/omit.js":[function(require,module,exports){
var arrayMap = require('./_arrayMap'),
    baseDifference = require('./_baseDifference'),
    baseFlatten = require('./_baseFlatten'),
    basePick = require('./_basePick'),
    getAllKeysIn = require('./_getAllKeysIn'),
    rest = require('./rest'),
    toKey = require('./_toKey');

/**
 * The opposite of `_.pick`; this method creates an object composed of the
 * own and inherited enumerable string keyed properties of `object` that are
 * not omitted.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [props] The property identifiers to omit.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.omit(object, ['a', 'c']);
 * // => { 'b': '2' }
 */
var omit = rest(function(object, props) {
  if (object == null) {
    return {};
  }
  props = arrayMap(baseFlatten(props, 1), toKey);
  return basePick(object, baseDifference(getAllKeysIn(object), props));
});

module.exports = omit;

},{"./_arrayMap":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayMap.js","./_baseDifference":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseDifference.js","./_baseFlatten":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseFlatten.js","./_basePick":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_basePick.js","./_getAllKeysIn":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_getAllKeysIn.js","./_toKey":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_toKey.js","./rest":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/rest.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/once.js":[function(require,module,exports){
var before = require('./before');

/**
 * Creates a function that is restricted to invoking `func` once. Repeat calls
 * to the function return the value of the first invocation. The `func` is
 * invoked with the `this` binding and arguments of the created function.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * var initialize = _.once(createApplication);
 * initialize();
 * initialize();
 * // `initialize` invokes `createApplication` once
 */
function once(func) {
  return before(2, func);
}

module.exports = once;

},{"./before":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/before.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/pick.js":[function(require,module,exports){
var arrayMap = require('./_arrayMap'),
    baseFlatten = require('./_baseFlatten'),
    basePick = require('./_basePick'),
    rest = require('./rest'),
    toKey = require('./_toKey');

/**
 * Creates an object composed of the picked `object` properties.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [props] The property identifiers to pick.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.pick(object, ['a', 'c']);
 * // => { 'a': 1, 'c': 3 }
 */
var pick = rest(function(object, props) {
  return object == null ? {} : basePick(object, arrayMap(baseFlatten(props, 1), toKey));
});

module.exports = pick;

},{"./_arrayMap":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_arrayMap.js","./_baseFlatten":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseFlatten.js","./_basePick":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_basePick.js","./_toKey":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_toKey.js","./rest":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/rest.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/property.js":[function(require,module,exports){
var baseProperty = require('./_baseProperty'),
    basePropertyDeep = require('./_basePropertyDeep'),
    isKey = require('./_isKey'),
    toKey = require('./_toKey');

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

module.exports = property;

},{"./_baseProperty":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseProperty.js","./_basePropertyDeep":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_basePropertyDeep.js","./_isKey":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isKey.js","./_toKey":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_toKey.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/rest.js":[function(require,module,exports){
var apply = require('./_apply'),
    toInteger = require('./toInteger');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a function that invokes `func` with the `this` binding of the
 * created function and arguments from `start` and beyond provided as
 * an array.
 *
 * **Note:** This method is based on the
 * [rest parameter](https://mdn.io/rest_parameters).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Function
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var say = _.rest(function(what, names) {
 *   return what + ' ' + _.initial(names).join(', ') +
 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
 * });
 *
 * say('hello', 'fred', 'barney', 'pebbles');
 * // => 'hello fred, barney, & pebbles'
 */
function rest(func, start) {
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  start = nativeMax(start === undefined ? (func.length - 1) : toInteger(start), 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    switch (start) {
      case 0: return func.call(this, array);
      case 1: return func.call(this, args[0], array);
      case 2: return func.call(this, args[0], args[1], array);
    }
    var otherArgs = Array(start + 1);
    index = -1;
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = array;
    return apply(func, this, otherArgs);
  };
}

module.exports = rest;

},{"./_apply":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_apply.js","./toInteger":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/toInteger.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/result.js":[function(require,module,exports){
var castPath = require('./_castPath'),
    isFunction = require('./isFunction'),
    isKey = require('./_isKey'),
    toKey = require('./_toKey');

/**
 * This method is like `_.get` except that if the resolved value is a
 * function it's invoked with the `this` binding of its parent object and
 * its result is returned.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to resolve.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c1': 3, 'c2': _.constant(4) } }] };
 *
 * _.result(object, 'a[0].b.c1');
 * // => 3
 *
 * _.result(object, 'a[0].b.c2');
 * // => 4
 *
 * _.result(object, 'a[0].b.c3', 'default');
 * // => 'default'
 *
 * _.result(object, 'a[0].b.c3', _.constant('default'));
 * // => 'default'
 */
function result(object, path, defaultValue) {
  path = isKey(path, object) ? [path] : castPath(path);

  var index = -1,
      length = path.length;

  // Ensure the loop is entered when path is empty.
  if (!length) {
    object = undefined;
    length = 1;
  }
  while (++index < length) {
    var value = object == null ? undefined : object[toKey(path[index])];
    if (value === undefined) {
      index = length;
      value = defaultValue;
    }
    object = isFunction(value) ? value.call(object) : value;
  }
  return object;
}

module.exports = result;

},{"./_castPath":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_castPath.js","./_isKey":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_isKey.js","./_toKey":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_toKey.js","./isFunction":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isFunction.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/stubArray.js":[function(require,module,exports){
/**
 * A method that returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

module.exports = stubArray;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/stubFalse.js":[function(require,module,exports){
/**
 * A method that returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/toFinite.js":[function(require,module,exports){
var toNumber = require('./toNumber');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_INTEGER = 1.7976931348623157e+308;

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

module.exports = toFinite;

},{"./toNumber":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/toNumber.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/toInteger.js":[function(require,module,exports){
var toFinite = require('./toFinite');

/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger(value) {
  var result = toFinite(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

module.exports = toInteger;

},{"./toFinite":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/toFinite.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/toNumber.js":[function(require,module,exports){
var isFunction = require('./isFunction'),
    isObject = require('./isObject'),
    isSymbol = require('./isSymbol');

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = isFunction(value.valueOf) ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = toNumber;

},{"./isFunction":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isFunction.js","./isObject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObject.js","./isSymbol":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isSymbol.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/toString.js":[function(require,module,exports){
var baseToString = require('./_baseToString');

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;

},{"./_baseToString":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseToString.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/union.js":[function(require,module,exports){
var baseFlatten = require('./_baseFlatten'),
    baseUniq = require('./_baseUniq'),
    isArrayLikeObject = require('./isArrayLikeObject'),
    rest = require('./rest');

/**
 * Creates an array of unique values, in order, from all given arrays using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @returns {Array} Returns the new array of combined values.
 * @example
 *
 * _.union([2], [1, 2]);
 * // => [2, 1]
 */
var union = rest(function(arrays) {
  return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
});

module.exports = union;

},{"./_baseFlatten":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseFlatten.js","./_baseUniq":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseUniq.js","./isArrayLikeObject":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArrayLikeObject.js","./rest":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/rest.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/uniqueId.js":[function(require,module,exports){
var toString = require('./toString');

/** Used to generate unique IDs. */
var idCounter = 0;

/**
 * Generates a unique ID. If `prefix` is given, the ID is appended to it.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {string} [prefix=''] The value to prefix the ID with.
 * @returns {string} Returns the unique ID.
 * @example
 *
 * _.uniqueId('contact_');
 * // => 'contact_104'
 *
 * _.uniqueId();
 * // => '105'
 */
function uniqueId(prefix) {
  var id = ++idCounter;
  return toString(prefix) + id;
}

module.exports = uniqueId;

},{"./toString":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/toString.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/values.js":[function(require,module,exports){
var baseValues = require('./_baseValues'),
    keys = require('./keys');

/**
 * Creates an array of the own enumerable string keyed property values of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property values.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.values(new Foo);
 * // => [1, 2] (iteration order is not guaranteed)
 *
 * _.values('hi');
 * // => ['h', 'i']
 */
function values(object) {
  return object ? baseValues(object, keys(object)) : [];
}

module.exports = values;

},{"./_baseValues":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseValues.js","./keys":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/keys.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/wrapperLodash.js":[function(require,module,exports){
var LazyWrapper = require('./_LazyWrapper'),
    LodashWrapper = require('./_LodashWrapper'),
    baseLodash = require('./_baseLodash'),
    isArray = require('./isArray'),
    isObjectLike = require('./isObjectLike'),
    wrapperClone = require('./_wrapperClone');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates a `lodash` object which wraps `value` to enable implicit method
 * chain sequences. Methods that operate on and return arrays, collections,
 * and functions can be chained together. Methods that retrieve a single value
 * or may return a primitive value will automatically end the chain sequence
 * and return the unwrapped value. Otherwise, the value must be unwrapped
 * with `_#value`.
 *
 * Explicit chain sequences, which must be unwrapped with `_#value`, may be
 * enabled using `_.chain`.
 *
 * The execution of chained methods is lazy, that is, it's deferred until
 * `_#value` is implicitly or explicitly called.
 *
 * Lazy evaluation allows several methods to support shortcut fusion.
 * Shortcut fusion is an optimization to merge iteratee calls; this avoids
 * the creation of intermediate arrays and can greatly reduce the number of
 * iteratee executions. Sections of a chain sequence qualify for shortcut
 * fusion if the section is applied to an array of at least `200` elements
 * and any iteratees accept only one argument. The heuristic for whether a
 * section qualifies for shortcut fusion is subject to change.
 *
 * Chaining is supported in custom builds as long as the `_#value` method is
 * directly or indirectly included in the build.
 *
 * In addition to lodash methods, wrappers have `Array` and `String` methods.
 *
 * The wrapper `Array` methods are:
 * `concat`, `join`, `pop`, `push`, `shift`, `sort`, `splice`, and `unshift`
 *
 * The wrapper `String` methods are:
 * `replace` and `split`
 *
 * The wrapper methods that support shortcut fusion are:
 * `at`, `compact`, `drop`, `dropRight`, `dropWhile`, `filter`, `find`,
 * `findLast`, `head`, `initial`, `last`, `map`, `reject`, `reverse`, `slice`,
 * `tail`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, and `toArray`
 *
 * The chainable wrapper methods are:
 * `after`, `ary`, `assign`, `assignIn`, `assignInWith`, `assignWith`, `at`,
 * `before`, `bind`, `bindAll`, `bindKey`, `castArray`, `chain`, `chunk`,
 * `commit`, `compact`, `concat`, `conforms`, `constant`, `countBy`, `create`,
 * `curry`, `debounce`, `defaults`, `defaultsDeep`, `defer`, `delay`,
 * `difference`, `differenceBy`, `differenceWith`, `drop`, `dropRight`,
 * `dropRightWhile`, `dropWhile`, `extend`, `extendWith`, `fill`, `filter`,
 * `flatMap`, `flatMapDeep`, `flatMapDepth`, `flatten`, `flattenDeep`,
 * `flattenDepth`, `flip`, `flow`, `flowRight`, `fromPairs`, `functions`,
 * `functionsIn`, `groupBy`, `initial`, `intersection`, `intersectionBy`,
 * `intersectionWith`, `invert`, `invertBy`, `invokeMap`, `iteratee`, `keyBy`,
 * `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`, `matchesProperty`,
 * `memoize`, `merge`, `mergeWith`, `method`, `methodOf`, `mixin`, `negate`,
 * `nthArg`, `omit`, `omitBy`, `once`, `orderBy`, `over`, `overArgs`,
 * `overEvery`, `overSome`, `partial`, `partialRight`, `partition`, `pick`,
 * `pickBy`, `plant`, `property`, `propertyOf`, `pull`, `pullAll`, `pullAllBy`,
 * `pullAllWith`, `pullAt`, `push`, `range`, `rangeRight`, `rearg`, `reject`,
 * `remove`, `rest`, `reverse`, `sampleSize`, `set`, `setWith`, `shuffle`,
 * `slice`, `sort`, `sortBy`, `splice`, `spread`, `tail`, `take`, `takeRight`,
 * `takeRightWhile`, `takeWhile`, `tap`, `throttle`, `thru`, `toArray`,
 * `toPairs`, `toPairsIn`, `toPath`, `toPlainObject`, `transform`, `unary`,
 * `union`, `unionBy`, `unionWith`, `uniq`, `uniqBy`, `uniqWith`, `unset`,
 * `unshift`, `unzip`, `unzipWith`, `update`, `updateWith`, `values`,
 * `valuesIn`, `without`, `wrap`, `xor`, `xorBy`, `xorWith`, `zip`,
 * `zipObject`, `zipObjectDeep`, and `zipWith`
 *
 * The wrapper methods that are **not** chainable by default are:
 * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clamp`, `clone`,
 * `cloneDeep`, `cloneDeepWith`, `cloneWith`, `deburr`, `divide`, `each`,
 * `eachRight`, `endsWith`, `eq`, `escape`, `escapeRegExp`, `every`, `find`,
 * `findIndex`, `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `first`,
 * `floor`, `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`,
 * `forOwnRight`, `get`, `gt`, `gte`, `has`, `hasIn`, `head`, `identity`,
 * `includes`, `indexOf`, `inRange`, `invoke`, `isArguments`, `isArray`,
 * `isArrayBuffer`, `isArrayLike`, `isArrayLikeObject`, `isBoolean`,
 * `isBuffer`, `isDate`, `isElement`, `isEmpty`, `isEqual`, `isEqualWith`,
 * `isError`, `isFinite`, `isFunction`, `isInteger`, `isLength`, `isMap`,
 * `isMatch`, `isMatchWith`, `isNaN`, `isNative`, `isNil`, `isNull`,
 * `isNumber`, `isObject`, `isObjectLike`, `isPlainObject`, `isRegExp`,
 * `isSafeInteger`, `isSet`, `isString`, `isUndefined`, `isTypedArray`,
 * `isWeakMap`, `isWeakSet`, `join`, `kebabCase`, `last`, `lastIndexOf`,
 * `lowerCase`, `lowerFirst`, `lt`, `lte`, `max`, `maxBy`, `mean`, `meanBy`,
 * `min`, `minBy`, `multiply`, `noConflict`, `noop`, `now`, `nth`, `pad`,
 * `padEnd`, `padStart`, `parseInt`, `pop`, `random`, `reduce`, `reduceRight`,
 * `repeat`, `result`, `round`, `runInContext`, `sample`, `shift`, `size`,
 * `snakeCase`, `some`, `sortedIndex`, `sortedIndexBy`, `sortedLastIndex`,
 * `sortedLastIndexBy`, `startCase`, `startsWith`, `stubArray`, `stubFalse`,
 * `stubObject`, `stubString`, `stubTrue`, `subtract`, `sum`, `sumBy`,
 * `template`, `times`, `toFinite`, `toInteger`, `toJSON`, `toLength`,
 * `toLower`, `toNumber`, `toSafeInteger`, `toString`, `toUpper`, `trim`,
 * `trimEnd`, `trimStart`, `truncate`, `unescape`, `uniqueId`, `upperCase`,
 * `upperFirst`, `value`, and `words`
 *
 * @name _
 * @constructor
 * @category Seq
 * @param {*} value The value to wrap in a `lodash` instance.
 * @returns {Object} Returns the new `lodash` wrapper instance.
 * @example
 *
 * function square(n) {
 *   return n * n;
 * }
 *
 * var wrapped = _([1, 2, 3]);
 *
 * // Returns an unwrapped value.
 * wrapped.reduce(_.add);
 * // => 6
 *
 * // Returns a wrapped value.
 * var squares = wrapped.map(square);
 *
 * _.isArray(squares);
 * // => false
 *
 * _.isArray(squares.value());
 * // => true
 */
function lodash(value) {
  if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
    if (value instanceof LodashWrapper) {
      return value;
    }
    if (hasOwnProperty.call(value, '__wrapped__')) {
      return wrapperClone(value);
    }
  }
  return new LodashWrapper(value);
}

// Ensure wrappers are instances of `baseLodash`.
lodash.prototype = baseLodash.prototype;
lodash.prototype.constructor = lodash;

module.exports = lodash;

},{"./_LazyWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_LazyWrapper.js","./_LodashWrapper":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_LodashWrapper.js","./_baseLodash":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_baseLodash.js","./_wrapperClone":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/_wrapperClone.js","./isArray":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isArray.js","./isObjectLike":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/ampersand-view/node_modules/lodash/isObjectLike.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-input-view/node_modules/matches-selector/index.js":[function(require,module,exports){
module.exports=require("/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/matches-selector/index.js")
},{"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/matches-selector/index.js":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/node_modules/ampersand-view/node_modules/matches-selector/index.js"}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/domready/ready.js":[function(require,module,exports){
/*!
  * domready (c) Dustin Diaz 2014 - License MIT
  */
!function (name, definition) {

  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()

}('domready', function () {

  var fns = [], listener
    , doc = document
    , hack = doc.documentElement.doScroll
    , domContentLoaded = 'DOMContentLoaded'
    , loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)


  if (!loaded)
  doc.addEventListener(domContentLoaded, listener = function () {
    doc.removeEventListener(domContentLoaded, listener)
    loaded = 1
    while (listener = fns.shift()) listener()
  })

  return function (fn) {
    loaded ? setTimeout(fn, 0) : fns.push(fn)
  }

});

},{}],"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/test/test.js":[function(require,module,exports){
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
},{"../ampersand-input-number-step-view":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/ampersand-input-number-step-view.js","ampersand-form-view":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/ampersand-form-view/ampersand-form-view.js","domready":"/Library/WebServer/Documents/libs/ampersand-input-number-step-view/node_modules/domready/ready.js"}]},{},["/Library/WebServer/Documents/libs/ampersand-input-number-step-view/test/test.js"]);
