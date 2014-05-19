var Game = function (c) {

  // Get canvas context
  var ctx = c.getContext('2d');

  // Get window width and set it to canvas width
  var w = c.width = $(window).width();

  // Calculate scaling parameter
  var s = w / 2048;

  // Calculate scaled canvas height
  var h = c.height = 1536 * s;

  // Attempt to create Web Audio API AudioContext
  var context;
  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
  } catch (e) {
    alert('Web Audio API is not supported in this browser.');
  }

  var state = 0;
  var song = 0;
  var paused = false;
  var gameover = false;
  var timeup = false;
  var tscore = 10;
  var nscore = 10;

  var timer;
  var delay = 2000;


  // List of all game states/stages
  var states = {
    loading: 0,
    main: 1,
    menu: 2,
    game: 3,
    free: 4
  };

  // List of all song notes structured by song, right/left hand, and note. Note of 0 is empty.
  var songs = [
    [
      [40, 40, 40, 40, 40, 40, 40, 40, 0, 0, 0, 0, 0, 0, 0, 0, 40, 40, 40, 40, 0, 0, 0, 0, 40, 40, 0, 0, 40, 40, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 40, 40, 40, 40, 40, 40, 40, 40, 0, 0, 0, 0, 40, 40, 40, 40, 0, 0, 40, 40, 0, 0, 40, 40]
    ],
    [
      [40, 40, 40, 0, 0, 0, 40, 0, 40, 40, 0, 40, 0, 40, 0, 40, 0, 40, 0],
      [0, 0, 0, 40, 40, 40, 0, 40, 0, 0, 40, 0, 40, 0, 40, 0, 40, 0, 40]
    ],
    [
      [40, 42, 40, 42, 40, 42, 40, 42, 40, 42, 40, 42, 40, 42, 40, 40, 40, 40, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 40, 40, 40, 40]
    ],
    [
      [40, 40, 40, 40, 42, 42, 42, 42, 40, 40, 40, 40, 42, 42, 42, 42, 40, 42, 42, 42, 40, 40, 40, 42, 40, 42, 40],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    [
      [0, 42, 0, 42, 0, 0, 42, 0, 42, 0, 42, 42, 0, 0, 0, 42, 42, 42, 0, 42, 42, 0, 0],
      [40, 0, 40, 0, 40, 40, 0, 40, 0, 40, 0, 0, 40, 40, 40, 0, 0, 0, 40, 0, 0, 40, 40]
    ],
    [
      [40, 40, 42, 42, 44, 44, 42, 42, 40, 40, 42, 42, 44, 44, 42, 42, 44, 40, 44, 42, 44, 40, 40, 40, 42, 44, 40, 44, 40],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    [
      [44, 42, 40, 42, 44, 44, 44, 42, 42, 42, 44, 44, 44, 44, 42, 40, 42, 44, 44, 44, 40, 42, 42, 44, 42, 40],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    [
      [40, 40, 42, 44, 40, 44, 42, 0, 40, 40, 42, 44, 40, 0, 0, 40, 40, 42, 44, 45, 44, 42, 40, 0, 0, 0, 0, 0, 40],
      [0, 0, 0, 0, 0, 0, 0, 35, 0, 0, 0, 0, 0, 39, 35, 0, 0, 0, 0, 0, 0, 0, 0, 39, 35, 37, 39, 40, 0]
    ],
    [
      [0, 0, 42, 42, 44, 44, 42, 0, 0, 0, 0, 0, 0, 0, 42, 42, 40, 40, 0, 0, 0, 42, 42, 40, 40, 0, 0, 0, 0, 0, 42, 42, 44, 44, 42, 0, 0, 0, 0, 0, 0, 0],
      [35, 35, 0, 0, 0, 0, 0, 40, 40, 39, 39, 37, 37, 35, 0, 0, 0, 0, 39, 39, 37, 0, 0, 0, 0, 39, 39, 37, 35, 35, 0, 0, 0, 0, 0, 40, 40, 39, 39, 37, 37, 35]
    ],
    [
      [0, 0, 0, 0, 0, 0, 0, 0, 40, 42, 47, 47, 47, 42, 42, 42, 0, 0, 0, 0, 0, 0, 42, 40, 0, 0, 0],
      [35, 35, 35, 37, 39, 39, 37, 39, 0, 0, 0, 0, 0, 0, 0, 0, 39, 39, 39, 35, 35, 35, 0, 0, 39, 37, 35]
    ]
  ];

  // Load all images asynchronously
  var bg = {
    main: loadImage('/img/bg-main.png'),
    menu: loadImage('/img/bg-menu.png'),
    game: loadImage('/img/bg-game.png'),
    paused: loadImage('/img/popup/paused.png')
  };
  var btn = loadButtons(['play', 'exit', 'options', 'help', 'help2', 'pause', 'restart', 'menu', 'continue', 'retry']);
  var song_btn = loadSongButtons(songs.length);
  var ms = loadImage('/img/ms08.png');
  var notes = loadNoteImages([33, 35, 37, 39, 40, 42, 44, 45, 47]);
  var cright = loadImage('/img/notes/40-right.png');
  var sharp = loadImage('/img/notes/sharp.png');
  var tracker = {
    pos: 0,
    time: 0,
    img: {
      active: loadImage('/img/btn/tracker-active.png'),
      alert: loadImage('/img/btn/tracker-alert.png')
    }
  };
  var wk = {
    i: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    n: [33, 35, 37, 39, 40, 42, 44, 45, 47],
    down: -1,
    img: {
      up: loadImage('/img/btn/wk.png'),
      down: loadImage('/img/btn/wk-down.png')
    }
  };
  var bk = {
    i: [0, 1, 2, 4, 5, 7],
    n: [34, 36, 38, 41, 43, 46],
    down: -1,
    img: {
      up: loadImage('/img/btn/bk.png'),
      down: loadImage('/img/btn/bk-down.png')
    }
  };
  var labels = loadImage('/img/labels.png');
  var paused = loadImage('/img/popup/paused.png');
  var scores = [];
  scores[1] = loadImage('/img/popup/1-star.png');
  scores[2] = loadImage('/img/popup/2-star.png');
  scores[3] = loadImage('/img/popup/3-star.png');

  // Load note tones synchronously using Web Audio API
  var tones = {};
  var tone_names = ['wrong', 'click'];
  for (var i = 33; i < 48; i++) tone_names.push(i);
  var nTones = tone_names.length;
  var loadedTones = 0;
  var loadTone = function (i) {
    if (i < nTones) {
      var request = new XMLHttpRequest();
      request.open('GET', '/snd/' + tone_names[i] + '.mp3', true);
      request.responseType = 'arraybuffer';
      request.onload = function () {
        context.decodeAudioData(request.response, function (buffer) {
          tones[tone_names[i]] = buffer;
          loadTone(++loadedTones);
        }, function (error) {
          console.log(error);
        });
      };
      request.send();
    } else state = states.main;
  };
  loadTone(loadedTones);

  /**
   * Mouse down event listener
   *
   * @param (Object) e
   */
  c.onmousedown = function (e) {

    // Determine x & y coordinates relative to canvas
    var mp = getMousePos(c, e);
    var x = mp.x;
    var y = mp.y;

    // Determine what button was pressed based on current state and relative, scaled button coordinates
    switch (state) {

      case states.main:
      {

        [btn.play, btn.exit, btn.options, btn.help].forEach(function (b, i) {
          var _w = b.img.up.width;
          var _h = b.img.up.height;
          var xo = (340 + (_w + 55) * i) * s;
          var yo = h - (120 + _h) * s;
          if (xo <= x && x <= xo + _w * s && yo <= y && y <= yo + _h * s) {
            playSound('click');
            b.down = true;
          }
        });

        break;

      }

      case states.menu:
      {

        song_btn.forEach(function (b, i) {
          var _w = b.img.up.width;
          var _h = b.img.up.height;
          var xo = (250 + (_w + 50) * (i % 5)) * s;
          var yo = (60 + (_h + 50) * Math.floor(i / 5)) * s;
          if (xo <= x && x <= xo + _w * s && yo <= y && y <= yo + _h * s) {
            playSound('click');
            b.down = true;
          }
        });

        [btn.exit, btn.options, btn.help].forEach(function (b, i) {
          var _w = b.img.up.width;
          var _h = b.img.up.height;
          var xo = (520 + (_w + 55) * i) * s;
          var yo = h - (30 + _h) * s;
          if (xo <= x && x <= xo + _w * s && yo <= y && y <= yo + _h * s) {
            playSound('click');
            b.down = true;
          }
        });

        break;

      }

      case states.game:
      {

        if (paused) {

          paused = false;
          if (timer) timer.resume();

        } else if (gameover) {

          [btn.continue, btn.retry].forEach(function (b, i) {
            var _w = b.img.up.width;
            var _h = b.img.up.height;
            var xo = (718 + (_w + 55) * i) * s;
            var yo = h - (530 + _h) * s;
            if (xo <= x && x <= xo + _w * s && yo <= y && y <= yo + _h * s) {
              playSound('click');
              b.down = true;
            }
          });

        } else {

          [btn.help2, btn.pause, btn.restart, btn.menu].forEach(function (b, i) {
            var _w = b.img.up.width;
            var _h = b.img.up.height;
            var xo = (384 + (_w + 55) * i) * s;
            var yo = 60 * s;
            if (xo <= x && x <= xo + _w * s && yo <= y && y <= yo + _h * s) {
              playSound('click');
              b.down = true;
            }
          });

          wk.down = -1;
          bk.down = getBlackKey(x, y);
          if (bk.down < 0) {

            wk.down = getWhiteKey(x, y);
            if (wk.down >= 0) {
              if (wk.n[wk.down] == songs[song][0][tracker.pos] || wk.n[wk.down] == songs[song][1][tracker.pos]) {

                playSound(wk.n[wk.down]);
                timeup = false;
                tracker.pos++;
                if (timer) timer.pause();
                if (nscore < 0) nscore = 0;
                if (tscore < 0) tscore = 0;
                if (tracker.pos == songs[song][0].length) {
                  gameover = true;
                } else {
                  timer = new Timer(function () {
                    playSound('wrong');
                    tscore--;
                    timeup = true;
                  }, delay);
                }

              } else {

                playSound('wrong');
                nscore--;

              }
            }

          } else {

            if (bk.n[wk.down] == songs[song][0][tracker.pos] || bk.n[bk.down] == songs[song][1][tracker.pos]) {
              playSound(bk.n[bk.down]);
              timeup = false;
              tracker.pos++;
              if (timer) timer.pause();
              if (nscore < 0) nscore = 0;
              if (tscore < 0) tscore = 0;
              if (tracker.pos == songs[song][0].length) {
                gameover = true;
              } else {
                timer = new Timer(function () {
                  playSound('wrong');
                  tscore--;
                  timeup = true;
                }, delay);
              }

            } else {

              playSound('wrong');
              nscore--;

            }

          }

        }

        break;

      }

      case states.free:
      {

        break;

      }

    }
  };

  /**
   * Mouse up event listener
   *
   * @param (Object) e
   */
  c.onmouseup = function (e) {

    // Determine x & y coordinates relative to canvas
    var mp = getMousePos(c, e);
    var x = mp.x;
    var y = mp.y;

    // Determine what button was released based on current state and relative, scaled button coordinates
    switch (state) {

      case states.main:
      {

        [btn.play, btn.exit, btn.options, btn.help].forEach(function (b, i) {
          if (b.down) {
            var _w = b.img.up.width;
            var _h = b.img.up.height;
            var xo = (340 + (_w + 55) * i) * s;
            var yo = h - (120 + _h) * s;
            if (xo <= x && x <= xo + _w * s && yo <= y && y <= yo + _h * s) {
              if (b == btn.play) {
                state = states.menu;
              }
            }
          }
        });

        break;

      }

      case states.menu:
      {

        song_btn.forEach(function (b, i) {
          if (b.down) {
            var _w = b.img.up.width;
            var _h = b.img.up.height;
            var xo = (250 + (_w + 50) * (i % 5)) * s;
            var yo = (60 + (_h + 50) * Math.floor(i / 5)) * s;
            if (xo <= x && x <= xo + _w * s && yo <= y && y <= yo + _h * s) {
              startSong(i);
            }
          }
        });

        [btn.exit, btn.options, btn.help].forEach(function (b, i) {
          if (b.down) {
            var _w = b.img.up.width;
            var _h = b.img.up.height;
            var xo = (520 + (_w + 55) * i) * s;
            var yo = h - (30 + _h) * s;
            if (xo <= x && x <= xo + _w * s && yo <= y && y <= yo + _h * s) {
              if (b == btn.exit) {
                state = states.main;
              }
            }
          }
        });

        break;

      }

      case states.game:
      {

        if (gameover) [btn.continue, btn.retry].forEach(function (b, i) {
          var _w = b.img.up.width;
          var _h = b.img.up.height;
          var xo = (718 + (_w + 55) * i) * s;
          var yo = h - (530 + _h) * s;
          if (xo <= x && x <= xo + _w * s && yo <= y && y <= yo + _h * s) {
            if (b == btn.retry) {
              startSong(song);
            } else {
              state = states.menu;
            }
          }
        });

        else [btn.help2, btn.pause, btn.restart, btn.menu].forEach(function (b, i) {
          if (b.down) {
            var _w = b.img.up.width;
            var _h = b.img.up.height;
            var xo = (384 + (_w + 55) * i) * s;
            var yo = 60 * s;
            if (xo <= x && x <= xo + _w * s && yo <= y && y <= yo + _h * s) {
              if (timer) timer.pause();
              if (b == btn.help) {
                //showHelp();
              } else if (b == btn.pause) {
                paused = true;
              } else if (b == btn.restart) {
                startSong(song);
              } else if (b == btn.menu) {
                state = states.menu;
              }
            }
          }
        });

        break;

      }

      case states.free:
      {
        break;
      }

    }

    $.each(btn, function (i, b) {
      b.down = false;
    });

    song_btn.forEach(function (b, i) {
      b.down = false;
    });

    wk.down = -1;
    bk.down = -1;

  };

  // Set FPS (refresh/redraw rate) to 30
  setInterval(redraw, 1000 / 30);

  /**
   * Draw all elements/buttons on the canvas based on current state
   */
  function redraw() {

    // Clear the entire canvas
    ctx.clearRect(0, 0, w, h);

    // Handle each state separately
    switch (state) {

      case states.loading:
      {

        // Background
        ctx.drawImage(bg.main, 0, 0, w, h);

        // Draw progress bar
        var _w = btn.play.img.up.width;
        _w = (_w * 4 + 55 * 3) * s;
        var _h = btn.play.img.up.height;
        var xo = 340 * s;
        var yo = h - (120 + _h) * s;
        ctx.rect(xo, yo, _w, _h * s);
        ctx.stroke();

        // Draw progress
        var p = loadedTones / nTones;
        ctx.fillRect(xo, yo, _w * p, _h * s);

        break;

      }

      case states.main:
      {

        // Background
        ctx.drawImage(bg.main, 0, 0, w, h);

        // Function buttons
        [btn.play, btn.exit, btn.options, btn.help].forEach(function (b, i) {
          var _w = b.img.up.width;
          var _h = b.img.up.height;
          var xo = (340 + (_w + 55) * i) * s;
          var yo = h - (120 + _h) * s;
          ctx.drawImage(b.down ? b.img.down : b.img.up, xo, yo, _w * s, _h * s);
        });

        break;

      }

      case states.menu:
      {

        // Background
        ctx.drawImage(bg.menu, 0, 0, w, h);

        // Song buttons
        song_btn.forEach(function (b, i) {
          var _w = b.img.up.width;
          var _h = b.img.up.height;
          var xo = (250 + (_w + 50) * (i % 5)) * s;
          var yo = (60 + (_h + 50) * Math.floor(i / 5)) * s;
          ctx.drawImage(b.down ? b.img.down : b.img.up, xo, yo, _w * s, _h * s);
        });

        // Function buttons
        [btn.exit, btn.options, btn.help].forEach(function (b, i) {
          var _w = b.img.up.width;
          var _h = b.img.up.height;
          var xo = (520 + (_w + 55) * i) * s;
          var yo = h - (30 + _h) * s;
          ctx.drawImage(b.down ? b.img.down : b.img.up, xo, yo, _w * s, _h * s);
        });

        break;

      }

      case states.game:
      {

        // Background
        ctx.drawImage(bg.game, 0, 0, w, h);

        // Function Buttons
        [btn.help2, btn.pause, btn.restart, btn.menu].forEach(function (b, i) {
          var _w = b.img.up.width;
          var _h = b.img.up.height;
          var xo = (384 + (_w + 55) * i) * s;
          var yo = 60 * s;
          ctx.drawImage(b.down ? b.img.down : b.img.up, xo, yo, _w * s, _h * s);
        });

        // Music Sheet
        ctx.drawImage(ms, 235 * s, 235 * s, ms.width * s, ms.height * s);

        // Notes
        for (var i = 0; i < 8; i++) {

          var io = Math.floor(tracker.pos / 8) * 8;
          if (io + i < songs[song][0].length) {

            // Right hand notes
            var rhn = songs[song][0][io + i];
            if (rhn) {

              // Sharps
              if (isBlackKey(rhn)) {
                rhn--;
                ctx.drawImage(sharp, (235 + 12 + (12 + 176) * i) * s, (235 + 12) * s, sharp.width * s, sharp.height * s);
              }

              // Special case for middle C (left hand or right hand)
              if (rhn == 40) {
                ctx.drawImage(cright, (235 + 12 + (12 + 176) * i) * s, (235 + 12) * s, notes[33].width * s, notes[33].height * s);
              } else {
                ctx.drawImage(notes[rhn], (235 + 12 + (12 + 176) * i) * s, (235 + 12) * s, notes[33].width * s, notes[33].height * s);
              }

            }

            // Left hand notes
            var lhn = songs[song][1][io + i];
            if (lhn) {

              // Sharps
              if (isBlackKey(lhn)) {
                lhn--;
                ctx.drawImage(sharp, (235 + 12 + (12 + 176) * i) * s, (235 + 12 + 176 + 12) * s, sharp.width * s, sharp.height * s);
              }

              ctx.drawImage(notes[lhn], (235 + 12 + (12 + 176) * i) * s, (235 + 12 + 176 + 12) * s, notes[33].width * s, notes[33].height * s);

            }

          }

        }

        // Tracker
        ctx.drawImage(timeup ? tracker.img.alert : tracker.img.active, (235 + 60 + (12 + 176) * (tracker.pos % 8)) * s, (235 - 65) * s, tracker.img.active.width * s, tracker.img.active.height * s);

        // White Keys
        for (var n = 0; n < wk.i.length; n++) {
          var i = wk.i[n];
          var _w = wk.img.up.width;
          var _h = wk.img.up.height;
          var xo = (117 + _w * i) * s;
          var yo = h - 754 * s;
          ctx.drawImage(wk.down == n ? wk.img.down : wk.img.up, xo, yo, _w * s, _h * s);
        }

        // Black Keys
        for (var n = 0; n < bk.i.length; n++) {
          var i = bk.i[n];
          var _w = bk.img.up.width;
          var _h = bk.img.up.height;
          var xo = (117 - _w / 2 + wk.img.up.width * (i + 1)) * s;
          var yo = h - 754 * s;
          ctx.drawImage(bk.down == n ? bk.img.down : bk.img.up, xo, yo, _w * s, _h * s);
        }

        // Key Labels
        ctx.drawImage(labels, 170 * s, h - 500 * s, labels.width * s, labels.height * s);

        if (paused) {

          // Paused popup
          ctx.drawImage(bg.paused, 0, 0, w, h);

        } else if (gameover) {

          // Superscore
          var ss = tscore + nscore;

          // Scorecard popup based on superscore (1/2/3 stars)
          if (ss <= 6) {
            ctx.drawImage(scores[1], 0, 0, w, h);
          } else if (ss <= 13) {
            ctx.drawImage(scores[2], 0, 0, w, h);
          } else if (ss <= 20) {
            ctx.drawImage(scores[3], 0, 0, w, h);
          }

          // Score text in scorecard popup
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.font = (70 * s) + 'px Verdana';
          ctx.fillText(tscore, 1173 * s, 716 * s);
          ctx.fillText(nscore, 1173 * s, 800 * s);

          // Function buttons in scorecard popup
          [btn.continue, btn.retry].forEach(function (b, i) {
            var _w = b.img.up.width;
            var _h = b.img.up.height;
            var xo = (718 + (_w + 55) * i) * s;
            var yo = h - (530 + _h) * s;
            ctx.drawImage(b.down ? b.img.down : b.img.up, xo, yo, _w * s, _h * s);
          });

        }

        break;

      }

      case states.free:
      {

        break;

      }

    }
  }

  /**
   * Prepare variables to start a song given a song id
   *
   * @param (Number) id song's id
   */
  function startSong(id) {
    nscore = 10;
    tscore = 10;
    tracker.pos = 0;
    gameover = false;
    paused = false;
    song = id;
    state = states.game;
  }

  /**
   * Prepare variables to start free play mode
   */
  function startFreePlay() {
    tracker.pos = 0;
    gameover = false;
    paused = false;
    state = states.free;
  }


  /**
   * Check if key number represents a black key
   *
   * @param (Number) n key number
   * @returns {boolean}
   */
  function isBlackKey(n) {
    return bk.n.indexOf(n) != -1;
  }

  /**
   * Get white key number, if applicable, given x & y coordinates
   *
   * @param (Number) x
   * @param (Number) y
   * @returns {number}
   */
  function getWhiteKey(x, y) {
    for (var n = 0; n < wk.i.length; n++) {
      var i = wk.i[n];
      var _w = wk.img.up.width;
      var _h = wk.img.up.height;
      var xo = (117 + _w * i) * s;
      var yo = h - 754 * s;
      if (xo <= x && x <= xo + _w * s && yo <= y && y <= yo + _h * s) {
        return n;
      }
    }
    return -1;
  }

  /**
   * Get black key number, if applicable, given x & y coordinates
   *
   * @param (Number) x
   * @param (Number) y
   * @returns {number}
   */
  function getBlackKey(x, y) {
    for (var n = 0; n < bk.i.length; n++) {
      var i = bk.i[n];
      var _w = bk.img.up.width;
      var _h = bk.img.up.height;
      var xo = (117 - _w / 2 + wk.img.up.width * (i + 1)) * s;
      var yo = h - 754 * s;
      if (xo <= x && x <= xo + _w * s && yo <= y && y <= yo + _h * s) {
        return n;
      }
    }
    return -1;
  }

  /**
   * Play a sound that has already been loaded given the name
   *
   * @param (String) name
   */
  function playSound(name) {
    if (tones[name]) {
      var source = context.createBufferSource();
      source.buffer = tones[name];
      source.connect(context.destination);
      source.start(0);
    }
  }

};

/**
 * Load image asyncrhonously from given src/url
 *
 * @param (String) src
 * @returns {Image}
 */
function loadImage(src) {
  var img = new Image();
  img.src = src;
  return img;
}

/**
 * Load note images given list of note numbers
 *
 * @param (Array) notes
 * @returns {Object}
 */
function loadNoteImages(notes) {
  var img = {};
  for (var i = 0; i < notes.length; i++) {
    img[notes[i]] = loadImage('/img/notes/' + notes[i] + '.png');
  }
  return img;
}

/**
 * Load function button given names
 *
 * @param (String) name
 * @returns {{down: boolean, img: {up: Image, down: Image}}}
 */
function loadButton(name) {
  return {
    down: false,
    img: {
      up: loadImage('/img/btn/' + name + '.png'),
      down: loadImage('/img/btn/' + name + '-down.png')
    }
  };
}

/**
 * Load function buttons given list of names
 *
 * @param names
 * @returns {Object}
 */
function loadButtons(names) {
  var btn = {};
  for (var i = 0; i < names.length; i++) {
    btn[names[i]] = loadButton(names[i]);
  }
  return btn;
}

/**
 * Load song buttons given number of songs
 *
 * @param nSongs
 * @returns {Array}
 */
function loadSongButtons(nSongs) {
  var btn = [];
  for (var i = 0; i < nSongs; i++) {
    btn[i] = loadButton('songs/' + (i + 1));
  }
  return btn;
}

/**
 * Determine mouse coordinates given mouse event relative to canvas
 *
 * @param (Object) c
 * @param (Object) e
 * @returns {{x: number, y: number}}
 */
function getMousePos(c, e) {
  var r = c.getBoundingClientRect();
  return {
    x: e.clientX - r.left,
    y: e.clientY - r.top
  };
}

/**
 * Timer with pause/resume functionality
 *
 * @param (Function) callback called when timer finishes
 * @param (Number) delay millisecond delay time
 * @constructor
 */
function Timer(callback, delay) {

  var timerId, start, remaining = delay;

  /**
   * Pauses the timer
   */
  this.pause = function () {
    window.clearTimeout(timerId);
    remaining -= new Date() - start;
  };

  /**
   * Resumes the timer
   */
  this.resume = function () {
    start = new Date();
    timerId = window.setTimeout(callback, remaining);
  };

  this.resume();

}
