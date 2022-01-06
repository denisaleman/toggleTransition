/**
 * toggleTransition.js
 *
 * Tiny vanilla JavaScript plugin that helps you to show/hide/toggle DOM Element with CSS transitions without
 * worrying about visibility of the element (i.e. switching display:none or visibility:hidden) when
 * transition ends.
 *
 * @author  Denis Alemán
 * @license MIT
 * @copyright 2007-2021, Denis Alemán
 */

(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		define([], factory);
	} else if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.ToggleTransition = factory();
	}
})(typeof global !== "undefined" ? global : this.window || this.global, function () {
	"use strict";

	/**
	 * Constructor.
	 *
	 * @param {HTMLElement} node                            HTML Element to be toggled.
	 * @param {Object}      options                         User options
	 *
	 * @prop {string}       options.selector                Selector of the DOM element.
	 * @prop {string}       options.manageVisibilityWith    CSS property that determines element's visibility. (visibility|display)
	 * @prop {string}       options.showTransitionClassname CSS class defines properties to transition when show.
	 * @prop {string}       options.hideTransitionClassname CSS class defines properties to transition when hide.
	 * @prop {Function}     options.onShowTransitionEnd     Callback function triggers when show animation ends.
	 * @prop {Function}     options.onHideTransitionEnd     Callback function triggers when hide animation ends.
	 *
	 * @constructor
	 */
	function ToggleTransition(node, options) {
		this.init(node, options);
	}

	/**
	 * Plugin prototype
	 *
	 */
	ToggleTransition.prototype = (function () {
		var defaults = {
			manageVisibilityWith: "display",
		};

		/**
		 * Private Functions
		 * @private
		 */

		/**
		 * Add a single class to the element.
		 *
		 * @param   {HTMLElement} el        Element
		 * @param   {string}      className Class name to add.
		 * @return  {HTMLElement}           Element
		 */
		var _addClass = function (el, className) {
			if (el.classList) {
				el.classList.add(className);
			} else {
				var current = el.className,
					found = false;
				var all = current.split(" ");
				for (var i = 0; i < all.length, !found; i++) {
					found = all[i] === className;
				}
				if (!found) {
					if (current === "") {
						el.className = className;
					} else {
						el.className += " " + className;
					}
				}
			}

			return el;
		};

		/**
		 * Remove a single class from the element.
		 *
		 * @param   {HTMLElement} el        Element
		 * @param   {string}      className Class name to remove.
		 * @return  {HTMLElement}           Element
		 */
		var _removeClass = function (el, className) {
			if (el.classList) {
				el.classList.remove(className);
			} else {
				el.className = el.className.replace(
					new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"),
					" ",
				);
			}

			return el;
		};

		/**
		 * Determine whether the element has given class.
		 *
		 * @param   {HTMLElement} el        Element
		 * @param   {string}      className Class name to check.
		 * @return  {Boolean}               Return true if element has class, otherwise false.
		 */
		var _hasClass = function (el, className) {
			if (el.classList) {
				return el.classList.contains(className);
			} else {
				return new RegExp("(^| )" + className + "( |$)", "gi").test(el.className);
			}
		};

		/**
		 * Create a new custom event of type CustomEvent.
		 *
		 * @param  {string} eventName   Name of the event to be created.
		 * @return {Event}              Event object.
		 */
		var _createEvent = function (eventName, params) {
			params = params || {
				bubbles: true,
				cancelable: true,
				detail: undefined,
			};
			var event = document.createEvent("CustomEvent");
			event.initCustomEvent(eventName, params.bubbles, params.cancelable, params.detail);

			return event;
		};

		/**
		 * Merge defaults with user options.
		 *
		 * @param   {Object}    defaults    Default settings.
		 * @param   {Object}    options     User options.
		 * @return  {Object}                Extended object.
		 */
		var _extend = function (defaults, options) {
			var prop,
				extended = {};
			for (prop in defaults) {
				if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
					extended[prop] = defaults[prop];
				}
			}
			for (prop in options) {
				if (Object.prototype.hasOwnProperty.call(options, prop)) {
					extended[prop] = options[prop];
				}
			}

			return extended;
		};

		/**
		 * Toggles visibility of the element according to its state or to explicit value.
		 *
		 * @param  {HTMLElement}    el          HTML Element to be toggled
		 * @param  {Function}       callback    Callback function
		 * @param  {Boolean}        visible     Explicit value to be set
		 * @return {(*|this)}                   Callback function or `this`.
		 */
		var _updateIsHidden = function (el, callback, visible = null) {
			if (this.settings.manageVisibilityWith === "visibility") {
				if (visible) {
					el.style.visibility = "hidden";
				} else {
					el.style.removeProperty("visibility");
				}
			} else if (this.settings.manageVisibilityWith === "display") {
				if (visible) {
					el.style.display = "none";
				} else {
					el.style.removeProperty("display");
				}
			}
			return typeof callback === "function" ? setTimeout(callback.bind(this), 0) : false || this;
		};

		/**
		 * Returns the browser's supported transition end event type.
		 *
		 * In order to avoid multiple binding of event listener.
		 *
		 * @return  {string}    Event name.
		 */
		var _supportedTransitionendEvent = function () {
			var transitionendType;
			if (!transitionendType) {
				transitionendType = getBrowserSupportedTransitionend();
			}
			return transitionendType;

			function getBrowserSupportedTransitionend() {
				var t,
					el = document.createElement("fakeelement");

				var transitions = {
					transition: "transitionend",
					OTransition: "oTransitionEnd",
					MozTransition: "transitionend",
					WebkitTransition: "webkitTransitionEnd",
				};

				for (t in transitions) {
					if (el.style[t] !== undefined) {
						return transitions[t];
					}
				}

				throw "TransitionEnd event is not supported in this browser.";
			}
		};

		var _ifToggleSettingsOk = function (callback = function () {}) {
			if (this.settings.hideTransitionClassname && this.settings.hideTransitionClassname) {
				return callback.call(this);
			} else {
				throw new Error("`hideTransitionClassname` and `showTransitionClassname` are not defined.");
			}
		};

		/**
		 * Check whether the element is should be initially hidden.
		 *
		 * Based on classes assigned to the element.
		 *
		 * @return {Boolean}    Return true if the element has class
		 *                      `this.settings.hideTransitionClassname`, otherwise - false.
		 *
		 * @throws {Error}      When both classes assigned or none of them is present.
		 */
		var _setInitiallyHidden = function () {
			this.isHidden = function () {
				if (typeof this.settings.isHidden === "boolean") {
					return this.settings.isHidden;
				}

				return _ifToggleSettingsOk.call(this, function () {
					var hasClassHidden = _hasClass(this.$element, this.settings.hideTransitionClassname);
					var hasClassShown = _hasClass(this.$element, this.settings.showTransitionClassname);
					if (!hasClassHidden && !hasClassShown) {
						throw new Error(
							"Element must have one of the classes ['" +
								this.settings.hideTransitionClassname +
								"' or '" +
								this.settings.showTransitionClassname +
								"'].",
						);
					}
					if (hasClassHidden && hasClassShown) {
						throw new Error(
							"Element must have one class ['" +
								this.settings.hideTransitionClassname +
								"' or '" +
								this.settings.showTransitionClassname +
								"'], both given.",
						);
					}
					return hasClassHidden ? true : false;
				});
			}.call(this);

			_updateIsHidden.call(this, this.$element, null, this.isHidden);
		};

		/**
		 * Prepare arguments for off() and on() methods.
		 * @param  {(string|HTMLElement|Function)}  target  Element to which the action to be bound.
		 * @param  {(string|Function)}              action  Action to perform,
		 *                                                  'hide', 'show', 'toggle' or specific function.
		 * @return {[target, action]}                       Prepared arguments.
		 */
		var _prepareTargetActionArgs = function (target, action) {
			if (typeof target === "string") {
				target = document.querySelectorAll(target);
			} else if (typeof target === "function") {
				target = target.call(this, this.$element);
			}
			if (action === "hide" || action === "show" || action === "toggle") {
				action = this[action].bind(this);
			} else if (typeof action === "function") {
				action = action.bind(this);
			}
			return [target, action];
		};

		/**
		 * API Methods
		 * @public
		 */
		return {
			constructor: ToggleTransition,

			/**
			 * Initialization.
			 *
			 * @param {HTMLElement} node                            HTML Element to be toggled.
			 * @param {Object}      options                         User options
			 *
			 * @prop {string}       options.selector                Selector of the DOM element.
			 * @prop {string}       options.manageVisibilityWith    CSS property that determines element's visibility. (visibility|display)
			 * @prop {string}       options.showTransitionClassname CSS class defines properties to transition when show.
			 * @prop {string}       options.hideTransitionClassname CSS class defines properties to transition when hide.
			 * @prop {Function}     options.onShowTransitionEnd     Callback function triggers when show animation ends.
			 * @prop {Function}     options.onHideTransitionEnd     Callback function triggers when hide animation ends.
			 *
			 * @emits Emits `toggle-transition-initialized` when finish initialization.
			 */
			init: function (node, options) {
				this.settings = _extend(defaults, options);
				this.root = this.settings.root || document;
				this.$element = node;
				_setInitiallyHidden.call(this);
				this.$element.dispatchEvent(_createEvent("toggle-transition-initialized"));
			},

			/**
			 * Transition CSS properties by adding a class.
			 *
			 * @param  {string}     transitionClassname Class with CSS properties to be transitioned.
			 * @param  {Function}   callback            Callback function to be called afterwards.
			 * @param  {Function}   _onTransitionEnd    Callback function to be invoked when the transition completes.
			 * @return {(*|this)}                       Callback function or context.
			 */
			transition: function (transitionClassname, callback, _onTransitionEnd) {
				if (this.onTransitionEnd) {
					this.$element.removeEventListener(_supportedTransitionendEvent(), this.onTransitionEnd);
				}
				this.onTransitionEnd = function () {
					_onTransitionEnd();
					this.onTransitionEnd = undefined;
				}.bind(this);
				_addClass(this.$element, transitionClassname);
				if (typeof _onTransitionEnd === "function") {
					this.$element.addEventListener(_supportedTransitionendEvent(), this.onTransitionEnd, {
						once: true,
					});
				}

				return typeof callback === "function" ? callback.call(this) : false || this;
			},

			/**
			 * Display the element, using predefined transition.
			 *
			 * @param  {Function} callback Callback function.
			 * @return {(*|this)}          Callback function or context.
			 */
			show: function (callback) {
				_ifToggleSettingsOk.call(this, function () {
					_removeClass(this.$element, this.settings.hideTransitionClassname);
					_updateIsHidden.call(
						this,
						this.$element,
						function () {
							this.transition(
								this.settings.showTransitionClassname,
								function () {
									this.isHidden = false;
								}.bind(this),
								function () {
									if (typeof this.settings.onHideTransitionEnd === "function") {
										this.settings.onShowTransitionEnd.call(this, event);
									}
								}.bind(this),
							);
						}.bind(this),
						false,
					);
				});

				return typeof callback === "function" ? callback.call(this) : false || this;
			},

			/**
			 * Display the element, using predefined transition.
			 *
			 * @param  {Function} callback Callback function.
			 * @return {(*|this)}          Callback function or context.
			 */
			hide: function (callback) {
				_ifToggleSettingsOk.call(this, function () {
					_removeClass(this.$element, this.settings.showTransitionClassname);
					this.transition(
						this.settings.hideTransitionClassname,
						function () {
							this.isHidden = true;
						}.bind(this),
						function (event, transitionClassname) {
							_updateIsHidden.call(this, this.$element, null, true);
							if (typeof this.settings.onHideTransitionEnd === "function") {
								this.settings.onHideTransitionEnd.call(this, event, transitionClassname);
							}
						}.bind(this),
					);
				});

				return typeof callback === "function" ? callback.call(this) : false || this;
			},

			/**
			 * Toggles between hide() and show() for the element.
			 *
			 * The toggle() method checks the element for visibility. show() is run if an element is hidden.
			 * hide() is run if an element is visible - This creates a toggle effect.
			 *
			 * @param  {Function} callback Callback function
			 * @return {(*|this)}          Callback function, show(), hide() or context.
			 */
			toggle: function (callback) {
				var _return = this.isHidden ? this.show() : this.hide();

				return typeof callback === "function" ? callback.call(this) || _return : false || this;
			},

			/**
			 * Attach an event handler function for event to a node.
			 *
			 * Basically, can be used to define when to trigger show(), hide(), toggle() or specific handler functions.
			 *
			 * @example
			 * Show element when onMouseOver triggers on parent element.
			 * instance.on('mouseover', function (el) { return el.parentElement; }, 'show');
			 *
			 * @example
			 * Bind specific function to node defined with selector '.button'.
			 * instance.on('click', '.button', function () { alert('hello world!'); });
			 *
			 * @param  {string}                         event   An event name.
			 * @param  {(string|HTMLElement|Function)}  target  Element to which the action to be bound.
			 *                                                  Can be defined as a query selector, an HTMLElement or
			 *                                                  a function retrieving HTMLElement.
			 * @param  {(string|Function)}              action  Method to perform.
			 *                                                  'hide', 'show', 'toggle' or arbitrary function.
			 * @return {this}                                   Context.
			 */
			on: function (event, _target, _action) {
				var args = _prepareTargetActionArgs.call(this, _target, _action);
				args[0].addEventListener(event, args[1]);

				return this;
			},

			/**
			 * Detach event handler function of event from a node.
			 *
			 * Basically, it's opposite to on() method.
			 *
			 * @param  {string}                         event   An event name.
			 * @param  {(string|HTMLElement|Function)}  target  Element to which the action to be bound.
			 *                                                  Can be defined as a query selector, an HTMLElement or
			 *                                                  a function retrieving HTMLElement.
			 * @param  {(string|Function)}              action  Method to perform.
			 *                                                  'hide', 'show', 'toggle' or arbitrary function.
			 * @return {this}                                   Context.
			 */
			off: function (event, _target, _action) {
				var args = _prepareTargetActionArgs.call(this, _target, _action);
				args[0].removeEventListener(event, args[1]);

				return this;
			},
		};
	})();

	return ToggleTransition;
});
