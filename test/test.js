const ToggleTransition = require("../toggleTransition.js");
const _ = require("lodash");
const puppeteer = require("puppeteer");

const getMethods = (obj) => Object.getOwnPropertyNames(obj.prototype);
const chainingMethods = (obj) => _.difference(getMethods(obj), ["constructor", "init"]);

/**
 * Test jsdom is ok
 *
 */
test("Use jsdom in this test file", () => expect(document.createElement("div")).not.toBeNull());

/**
 * Test chaining methods return `this`
 *
 */
describe("Chaining methods can chain", () => {
  chainingMethods(ToggleTransition).forEach((method) => {
    test(method, () => {
      document.body.innerHTML = "<div id='dummyAnimatedElement' class='popover popover_is_shown'>Test</div>";

      let instance = new ToggleTransition(document.getElementById("dummyAnimatedElement"), {
        showTransitionClassname: "popover_is_shown",
        hideTransitionClassname: "popover_is_hidden",
      });

      let _return;
      switch(method) {
        case 'on' :
            _return = instance[method]('mouseover', document, function(){});
          break;
        case 'off' :
            _return = instance[method]('mouseover', document, function(){});
          break;
        default:
            _return = instance[method]();
      }

      expect(_return).toBeInstanceOf(ToggleTransition);
    });
  });
});

/**
 * Callbacks tests
 *
 */
describe("Callback functions of methods get invoked", () => {
  test("transition()'s", (done) => {
    document.body.innerHTML = "<div id='dummyAnimatedElement' class='popover popover_is_shown'>Test</div>";

    let instance = new ToggleTransition(document.getElementById("dummyAnimatedElement"), {
      showTransitionClassname: "popover_is_shown",
      hideTransitionClassname: "popover_is_hidden",
    });

    let mockCallbackFn = jest.fn(() => {
      try {
        expect(mockCallbackFn).toHaveBeenCalled();
        done();
      } catch (err) {
        done(err);
      }
    });

    instance.show(mockCallbackFn);
  });

  test("hide()'s", (done) => {
    document.body.innerHTML = "<div id='dummyAnimatedElement' class='popover popover_is_shown'>Test</div>";

    let instance = new ToggleTransition(document.getElementById("dummyAnimatedElement"), {
      showTransitionClassname: "popover_is_shown",
      hideTransitionClassname: "popover_is_hidden",
    });

    let mockCallbackFn = jest.fn(() => {
      try {
        expect(mockCallbackFn).toHaveBeenCalled();
        done();
      } catch (err) {
        done(err);
      }
    });

    instance.hide(mockCallbackFn);
  });

  test("show()'s", (done) => {
    document.body.innerHTML = "<div id='dummyAnimatedElement' class='popover popover_is_shown'>Test</div>";

    let instance = new ToggleTransition(document.getElementById("dummyAnimatedElement"), {
      showTransitionClassname: "popover_is_shown",
      hideTransitionClassname: "popover_is_hidden",
    });

    let mockCallbackFn = jest.fn(() => {
      try {
        expect(mockCallbackFn).toHaveBeenCalled();
        done();
      } catch (err) {
        done(err);
      }
    });

    instance.show(mockCallbackFn);
  });
});

/**
 * Events tests
 *
 */
describe("Custom events", () => {
  function triggerTransitionEnd(element) {
    let event = document.createEvent("Event");
    event.initEvent("transitionend", true, true);
    element.dispatchEvent(event);
  }

  test("`toggle-transition-initialized` fires when instance finishes initialization", (done) => {
    document.body.innerHTML = "<div id='dummyAnimatedElement' class='popover popover_is_hidden'>Test</div>";

    let mockCallbackFn = jest.fn(() => {
      try {
        expect(mockCallbackFn).toHaveBeenCalled();
        done();
      } catch (err) {
        done(err);
      }
    });

    document.addEventListener("toggle-transition-initialized", mockCallbackFn);

    let instance = new ToggleTransition(document.getElementById("dummyAnimatedElement"), {
      showTransitionClassname: "popover_is_shown",
      hideTransitionClassname: "popover_is_hidden",
    });
  });
});

/**
 * E2E Puppeteer tests
 *
 */
describe("Initially hidden element", () => {
  const elementHasClass = async (element, className) => {
    return await element
      .getProperty("className")
      .then((cn) => cn.jsonValue())
      .then((classNameString) => classNameString.split(" "))
      .then((classNameArray) => classNameArray.includes(className));
  };

  const puppeteerInitAndGoto = async (_goto) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(_goto);

    return { browser, page };
  };

  test("`transitionend` invokes event listener", async () => {
    const { browser, page } = await puppeteerInitAndGoto(`file://${__dirname}/../docs/example/initially_hidden.html`);
    const element = await page.$("#animatedElement");

    const mockCallbackFn = await jest.fn(() => {
      expect(mockCallbackFn).toHaveBeenCalled();
    });

    await page.exposeFunction("mockOnShowTransitionEnd", mockCallbackFn);
    await page.evaluate(() => {
      animatedElement.settings.onShowTransitionEnd = this.mockOnShowTransitionEnd;
    });

    await page.waitForTimeout(500);
    await page.evaluate(() => animatedElement.show());
    await browser.close();
  });

  test("toggles classes with toggle() correctly", async () => {
    const elementHasClassResults = [];
    const elementHasNotClassResults = [];

    const { browser, page } = await puppeteerInitAndGoto(`file://${__dirname}/../docs/example/initially_hidden.html`);

    const element = await page.$("#animatedElement");

    await elementHasClassResults.push(await elementHasClass(element, "popover_is_hidden"));
    await elementHasNotClassResults.push(await elementHasClass(element, "popover_is_shown"));

    await page.evaluate(() => animatedElement.toggle());
    await page.waitForTimeout(500);
    await elementHasClassResults.push(await elementHasClass(element, "popover_is_shown"));
    await elementHasNotClassResults.push(await elementHasClass(element, "popover_is_hidden"));

    await page.evaluate(() => animatedElement.toggle());
    await page.waitForTimeout(500);
    await elementHasClassResults.push(await elementHasClass(element, "popover_is_hidden"));
    await elementHasNotClassResults.push(await elementHasClass(element, "popover_is_shown"));

    await browser.close();

    expect(elementHasClassResults).toStrictEqual([true, true, true]);
    expect(elementHasNotClassResults).toStrictEqual([false, false, false]);
  });

  test("nothing gets broken if toggle() invokes quickly multiple times", async () => {
    const elementHasClassResults = [];

    const { browser, page } = await puppeteerInitAndGoto(`file://${__dirname}/../docs/example/initially_hidden.html`);

    const element = await page.$("#animatedElement");

    await page.evaluate(() => {
      for (var i = 20; i >= 0; i--) {
        animatedElement.toggle();
      }
    });

    await page.waitForTimeout(500);

    await elementHasClassResults.push(await elementHasClass(element, "popover_is_shown"));
    await elementHasClassResults.push(await elementHasClass(element, "popover_is_hidden"));
    /**
     * @todo Add check whether element has `style="display: none"` or `style="visibility: hidden"` with accordance to the `manageVisibilityWith` setting.
     */

    await browser.close();

    expect(elementHasClassResults).toStrictEqual([true, false]);
  });
});
