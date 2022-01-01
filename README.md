<img alt="Toggle transition" src="/misc/logo.svg" width="15%" style="min-width: 200px;">

# toggleTransition.js
Tiny vanilla JavaScript plugin that enables you to show/hide/toggle DOM Element taking advantage of CSS transitions and without worrying about details.

![npm](https://img.shields.io/npm/v/toggle-transition?logo=npm)
![npm bundle size (version)](https://img.shields.io/bundlephobia/minzip/toggle-transition/latest?label=gzipped)
![NPM](https://img.shields.io/npm/l/toggle-transition)
![npm](https://img.shields.io/npm/dw/toggle-transition?logo=npm)

## Problem

CSS3 transition doesn't work with `display` property.

> CSS3 transitions don't apply to the `display` property, i.e., you can't do any sort of transition from `display: none` to `display: block` (or any combination).

[Transitions on the CSS display property](https://stackoverflow.com/questions/3331353/transitions-on-the-css-display-property) on StackOverflow.

## How it solves the problem

The plugin shows/hides an element with CSS3 transition effects and manages its `display` property behind the scenes.

In case of hidding the element, `toggleTransition.js` sets element's `display` property to `none` right after transition ends, making use of `onTransitionEnd` event. 

If case of showing the element, it sets the `display` back to initial state. Then CSS transition runs and the element appears smoothly.

## In Action

[![toggle transition in action](/misc/inAction.gif)](https://denisaleman.github.io/toggleTransition/example/initially_hidden.html)

## Quickstart

#### Use CDN

```html
<script src="https://unpkg.com/toggle-transition@latest/toggleTransition.min.js"></script>
```

#### [Codepen](https://codepen.io/denisaleman/pen/oNGoqEm)

```html
<style>
  body {
    background-color: whitesmoke;
  }

  .example {
    width: 300px;
    background-color: floralwhite;
    padding: 10px 20px;
    box-shadow: 3px 3px 19px rgba(0, 0, 0, 0.2);
    position: relative;
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
    transform: translateY(0px) scale(0.9);
  }

  .is_shown {
    opacity: 1;
    transform: translateY(10px) scale(1);
  }

  .is_hidden {
    opacity: 0;
    transform: translateY(0) scale(0.9);
  }
</style>

<button class="button">Toggle It!</button>

<div class="example is_hidden">
  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa quisquam laboriosam quos tempore nobis quam officiis commodi. Eaque dolor eius animi voluptatum inventore? Eveniet, perspiciatis itaque obcaecati explicabo fugit blanditiis!
</div>

<script>
  var instance = new ToggleTransition(document.querySelector('.example'), {
    showTransitionClassname: "is_shown",
    hideTransitionClassname: "is_hidden",
    manageVisibilityWith: "visibility", // or "display"
    onShowTransitionEnd: function (e, x) {
      console.log("after show transition callback", e, x);
    },
    onHideTransitionEnd: function (e, x) {
      console.log("after hide transition callback", e, x);
    },
  });

  document.querySelector(".button").addEventListener("click", function () {
    instance.toggle();
  });
</script>
```

## Examples

 - [Basic](https://denisaleman.github.io/toggleTransition/example/initially_hidden.html) ([Initially hidden](https://denisaleman.github.io/toggleTransition/example/initially_hidden.html) | [Initially shown](https://denisaleman.github.io/toggleTransition/example/initially_shown.html))
 - [Multiple](https://denisaleman.github.io/toggleTransition/example/multiple.html)
 - [Menu](https://denisaleman.github.io/toggleTransition/example/menu.html)


## Install

Add package with your favorite package manager:

```bash
# npm
npm install toggle-transition

# yarn
yarn add toggle-transition
```

Add it to your project:

```js
require "toggle-transition"
```

## Contribute

All of these will be appreciated:
- Blog or tweet about the project
- Improve documentation
- Fix a bug
- Implement a new feature
- Discuss potential ways to improve project
- Add a TODO to the code
- Improve existing implementation, performance, etc.

This list of **[TODOs.md](TODOs.md)** has been kindly created for your convenience.

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Commit your changes: `git commit -am 'Add some feature'`
4.  Push to the branch: `git push origin my-new-feature`
5.  Submit a pull request.

## License

The code licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php). The logo and the sign used in the header are under [Creative Commons Attribution 3.0 Unported License](http://creativecommons.org/licenses/by/3.0/deed.en_US). You are free to do whatever you want, don't remove my name from the source.


###### Do you like this?
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/denisaleman)