/**
 * jQuery library for generic geometry calculations
 *
 * @author Monwara LLC / Branko Vukelic <branko@herdhound.com>
 * @version 0.0.1
 * @license MIT
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else {
    factory(root.jQuery);
  }
}(this, function($) {

  /**
   * #desiredPosition(elem, resize)
   * Set a closest match for desired position based on
   * window location.
   *
   * @param {jQuery/String} elem jQuery object or selector
   * @param {Integer} x Desired x coordinate
   * @param {Integer} y Desired y coordinate
   * @param {Boolean} resize Whether object should be resized to fit the
   * proposed positioning.
   * @return {jQuery} Element
   */
  $.fn.desiredPosition = function(x, y, resize) {
    $this = $(this);
    $parent = $this.offsetParent(); // find first positioned parent

    // Desired position
    var dX = x;
    var dY = y;
    var dW = $this.outerWidth();
    var dH = $this.outerHeight();
    var dX1 = dW + x;
    var dY1 = dH + y;

    // Window metrics
    pX = 0;
    pY = 0;
    pX1 = $parent.width();
    pY1 = $parent.height();

    var outOfBoundsLeft = false;
    var outOfBoundsRight = false;
    var outOfBoundsTop = false;
    var outOfBoundsBottom = false;
    var wider = dW > pX1;
    var taller = dH > pY1;

    if (dX < 0) {
      outOfBoundsLeft = true;
    }

    if (dX1 > pX1) {
      outOfBoundsRight = true;
    }

    if (dY < 0) {
      outOfBoundsTop = true;
    }

    if (dY1 > pY1) {
      outOfBoundsBottom = true;
    }

    var css = {position: 'absolute'};

    if (wider) {
      // Make it fit the parent if resize is true, otherwise just center it
      css.left = resize ? 0 : (wW - dW) / 2;
      css.right = resize ? 0 : wW ;
      if (resize) { css.width = 'auto'; }
    }
    
    if (outOfBoundsLeft && !outOfBoundsRight && resize) {
      // Fit only left edge if resize is true, otherwise, leave it alone
      css.left = dX;
      css.right = 'auto';
      css.width = 'auto';
    }

    if (!outOfBoundsLeft && outOfBoundsRight && resize) {
      // Fit only right edge if resize is true, otherwise, leave it alone
      css.left = 'auto';
      css.right = pX1 - dX1;
      css.width = 'auto';
    }

    if (taller) {
      // Make object fit vertically if resize is true, or center vertically
      css.top = resize ? 0 : (pH - dY1) / 2;
      css.bottom = resize ? 0 : 'auto';
      if (resize) { css.height = 'auto'; }
    }

    if (!outOfBoundsTop && outOfBoundsBottom && resize) {
      // Fit only bottom edge if resize is true, otherwise leave it alone
      css.bottom = 0;
      css.top = dY;
      css.height = 'auto';
    }

    if (outOfBoundsTop && !outOfBoundsBottom && resize) {
      // Fit only the top edge if resize is true, otherwise leave it alone
      css.top = 0;
      css.bottom = dY1;
      css.height = 'auto';
    }

    // Apply any CSS rules that have been set
    $this.css(css);

    return $this;
  };

  /**
   * Positioning algorithm for things like autocomplete boxes
   *
   * It is assumed that the element (`this`) is the direct child of the 
   * `<body>` element.
   *
   * If fixedX and/or fixedY are numbers, they set the X and Y coordinates
   * respectively. If they are `true`, they skip setting the X and Y
   * coordinates respectively.
   *
   * @param {jQuery/String} elem jQuery element or selector
   * @param {Boolean} fixedX Do not change X coordinates
   * @param {Boolean} fixedY Do not change Y coordinates
   * @return {jQuery} element
   */
  $.fn.relativeTo = function(elem, fixedX, fixedY) {
    var $this = $(this);
    var $elem = $(elem);
    var $win = $(window);

    // Set position to absolute in order to calculate the correct width &
    // height
    $this.css('position', 'absolute');

    fixedX = typeof fixedX === 'undefined' ? false : fixedX;
    fixedY = typeof fixedY === 'undefined' ? false : fixedY;

    var eX = $elem.offset().left;
    var eY = $elem.offset().top;
    var eW = $elem.outerWidth();
    var eH = $elem.outerHeight();

    var tW = $this.outerWidth();
    var tH = $this.outerHeight();

    var wW = $win.width();
    var wH = $win.height();

    if (fixedX !== true && typeof fixedX !== 'number') {
      if (eX + tW <= wW) {
        // Not out of bounds
        $this.css({
          position: 'absolute',
          left: eX
        });

      } else {
        // Is out of bounds on the right edge
        
        if (eX + eW - tW >= 0) {
          // Out of bounds on the right side, and there's room to align to 
          // the right edge
          $this.css({
            position: 'absolute',
            left: wW - eX - eW
          });
        } else {
          // Out of bounds on the right side, and there's no room to align
          // to the right edge
          $this.css({
            position: 'absolute',
            left: wW - tW
          });
        }
      }
    } else if (typeof fixedX === 'number') {
      $this.css({
        position: 'absolute',
        left: fixedX
      });
    }

    if (fixedY !== true && typeof fixedY !== 'number') {
      if (eY + eH + tH <= wH) {
        // Not out of bounds on the bottom edge
        $this.css({
          position: 'absolute',
          top: eY + eH
        });

      } else {
        // Out of bounds on the bottom edge

        if (eY + eH - tH >= 0) {
          // Out of bounds on bottom edge and there's room to align to 
          // top edge of the input
          $this.css({
            position: 'absolute',
            top: eY - tH
          });
        } else {
          // Out of bounds on bottom edge and no room to align to the bottom
          // edge of the input so we connect to ridght edge of window
          $this.css({
            position: 'absolute',
            top: wH - tH
          });
        }
      }
    } else if (typeof fixedY === 'number') {
      $this.css({
        position: 'absolute',
        top: fixedY
      });
    }

    return $this;

  };

  /**
   * Test wether an object contains a coordinate
   *
   * @param {Number} posX X coordinate
   * @param {Number} posY Y coordinate
   * @return {Boolean} `true` if cursor is within object's boundaries
   */
  $.fn.containsCursor = function(posX, posY) {
    function between(n, m, m1) {
      return m <= n && n <= m1;
    }

    var $this = $(this);

    var x = $this.offset().left;
    var y = $this.offset().top;
    var x1 = x + $this.outerWidth();
    var y1 = y + $this.outerHeight();

    return between(posX, x, x1) && between(posY, y, y1);
  };

  /**
   * Drag and drop with events
   *
   * If `droppable` parameter is supplied, it will be used as a selector for
   * droppable items that should detect if this object is dropped on them.
   *
   * There are 3 or 4 callbacks you can use to handle different stages of the 
   * drag & drop action.
   *
   * The `start` and `drag` callbacks are executed regardless of whether you
   * want to perform a simple drag, or drag & drop. `stop` callback is executed
   * when no `dropTarget` is specified, so it can be used to handle the 
   * end of drag motion (when user releases the mouse button).
   *
   * If `dropTarget` is specified, `drop` callback is called with first
   * argument either a jQuery object if drop landed on a drop target, or null
   * if drop landed on no target.
   * 
   * `start` is called with following parameters:
   *  + object's X coordinate (relative to page)
   *  + object's Y coordinate (relative to page)
   *  + object's X position
   *  + object's Y position
   *  + initial X coordinate of the mouse cursor
   *  + initail Y coordinate of the mouse cursor
   *
   * `drag` is called continuously throughout the drag motion with:
   *  + object's initial X coordinate (relative to page)
   *  + object's initial Y coordinate (relative to page)
   *  + object's initial X position
   *  + object's initial Y position
   *  + delta X (total movement along X axis)
   *  + delta Y (total movement along Y axis)
   *
   * `stop` is called with:
   *  + object's initial X coordinate (relative to page)
   *  + object's initial Y coordinate (relative to page)
   *  + object's initial X position
   *  + object's initial Y position
   *  + delta X (total movement along X axis)
   *  + delta Y (total movement along Y axis)
   *
   * `drop` is called with:
   *  + drop target object (jQuery object) or null if failed
   *  + object's initial X coordinate (relative to page)
   *  + object's initial Y coordinate (relative to page)
   *  + object's initial X position
   *  + object's initial Y position
   *  + delta X (total movement along X axis)
   *  + delta Y (total movement along Y axis)
   *
   * Options are:
   *
   *  + `start`: Callback executed when drag action starts
   *  + `drag`: Callback executed continuously while dragging
   *  + `stop`: Callback executed with drag if finished (but no drop is
   *    performed because `dropTarget` is unspecified)
   *  + `drop`: Callback executed when drop is performed
   *  + `dropTarget`: Selector for the drop target (required for `drop` to 
   *    work)
   *  + `clickTimeout`: Time after mousedown before action is considered a drag
   *    (default is 200ms)
   *
   * Example:
   *
   *  // Classic drag & drop
   *  $('.draggable').drag({
   *    start: function() {
   *      // Remove element from original position and append to document body
   *      $(this).appendTo(document.body);
   *      $(this).addClass('dragging');
   *      $(this).css('position', 'absolute');
   *    },
   *    drag: function(x, y, pX, pY, dX, dY, mX, mY) {
   *      $(this).css({
   *        left: mX, // follow mouse cursor
   *        top: mY // follow mouse cursor
   *      });
   *    },
   *    drop: function(target, x, y, pX, pY) {
   *      // Move element to the target
   *      $(this).appendTo(target);
   *      $(this).removeClass('dragging');
   *
   *      // NOTE: This doesn't handle the failed drop.
   *    },
   *    dropTarget: '.drop-target'
   *  });
   *
   *  // Drag an object and put it below target
   *  $('.draggable').drag({
   *    start: function(x, y) {
   *      // Remove element from original position
   *      $(this).appendTo(document.body);
   *      $(this).addClass('dragging');
   *      $(this).css({
   *        position: 'absolute',
   *        left: x,
   *        top: y
   *      });
   *    },
   *    drag: function(x, y, pX, pY, dX, dY) {
   *      // Move object based on its original position
   *      $(this).css({
   *        left: x + dX,
   *        top: y + dY
   *      });
   *    },
   *    drop: function(target, x, y, pX, pY, dX, dY) {
   *      // Drop it below the target
   *      $(this).insertAfter(target);
   *      $(this).removeClass('dragging');
   *
   *      // NOTE: This doesn't handle the failed drop.
   *    },
   *    dropTarget: '.drop-target'
   *  });
   *
   * @param {Object} opts Options
   * @return {jQuery} jquery object
   */
  $.fn.drag = function(opts) {
    var defaultOpts = {
      clickTimeout: 200
    };

    opts = $.extend({}, defaultOpts, opts);

    $(this).each(function(idx, elem) {
      var $this = $(elem);

      // Finish drag action
      function finishDrag(origX, origY, posX, posY, deltaX, deltaY, mouseX, mouseY) {
        $(window).off('mousemove.drag');

        if (!opts.dropTarget && typeof opts.stop === 'function') {
          return opts.stop.call($this, origX, origY, deltaX, deltaY);
        }

        var dropped = false;
        // Test if any drop target contains cursor. Callback is executed for 
        // each drop target.
        $(opts.dropTarget).each(function(idx, dropTarget) {
          if ($(dropTarget).contains(mouseX, mouseY)) {
            // This drop target contains a cursor
            if (typeof opts.drop === 'function') {
              opts.drop.call($this, $(dropTarget), origX, origY, posX, posY, deltaX, 
                         deltaY);
              dropped = true;
            }
          }
        });

        // If dropping failed, execute failed
        if (dropped === false && typeof opts.failed === 'function') {
          opts.drop.call($this, null, origY, deltaX, posX, posY, deltaY);
        }
      }

      // Handle the drag action
      function doDrag(origX, origY, posX, posY, origMouseX, origMouseY) {
        var deltaX = 0;
        var deltaY = 0;

        // Attach namespaced event listener
        $(window).on('mousemove.drag', function(e) {
          deltaX = e.pageX - origMouseX;
          deltaY = e.pageY - origMouseY;

          var cont = true;

          // Call the drag callback
          if (typeof opts.drag === 'function') {
            cont = opts.drag.call($this, origX, origY, posX, posY, deltaX, 
                              deltaY, e.pageX, e.pageY);
          }

          // If cont flag is false, finis drag action
          if (cont === false) {
            $(window).off('mouseup.drag');
            finishDrag(origX, origY, posX, posY, deltaX, deltaY, e);
          }
        });

        // Finish dragging on mouseup
        $(window).one('mouseup.drag', function(e) {
          $(window).off('mousemove.drag');

          deltaX = e.pageX - origMouseX;
          deltaY = e.pageY - origMouseY;

          finishDrag(origX, origY, posX, posY, deltaX, deltaY, e);
        });
      }

      // Record initial positions and pass on to doDrag
      function startDrag(e) {
        e.stopPropagation();
        e.preventDefault();

        // Remember original positions
        var x = $this.offset().left;
        var y = $this.offset().top;
        var pX = $this.position().left;
        var pY = $this.position().top;
        var mouseX = e.pageX;
        var mouseY = e.pageY;

        var cont = true;

        // Call the start callback
        if (typeof opts.start === 'function') {
          cont = opts.start.call($this, x, y, pX, pY, mouseX, mouseY);
        }

        // Only continue with drag if cont flag is set to true (default)
        if (cont !== false) {
          doDrag(x, y, pX, pY, mouseX, mouseY);
        }
      }

      // Handle mousedown and test if user intends to perform a drag & drop
      $this.on('mousedown', function(e) {
        var timer = setTimeout(function() {
          startDrag(e);
        }, opts.clickTimeout);

        $this.mouseup(function(e) {
          // User released mouse too early, so don't call it a drag
          if (timer) { clearTimeout(timer); }
        });
      });

    });

    return $(this);
  };

}));

