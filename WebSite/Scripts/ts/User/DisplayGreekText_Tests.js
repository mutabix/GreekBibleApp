﻿/// <reference path="../../typings/qunit/qunit.d.ts" />
/// <reference path="DisplayGreekText.ts" />
var Told;
(function (Told) {
    (function (GreekBible) {
        (function (UI) {
            (function (Tests) {
                test("Will load first word from Sample - James 1", function () {
                    var obj = new Told.GreekBible.UI.PassageViewModel();

                    obj.loadSample();

                    var result = obj.passage.entries[0].rawText;

                    equal(result, "Ἰάκωβος", "The first word is right");
                });

                test("Will load last word from Sample - James 1", function () {
                    var obj = new Told.GreekBible.UI.PassageViewModel();

                    obj.loadSample();

                    var result = obj.passage.entries[obj.passage.entries.length - 1].rawText;

                    equal(result, "κόσμου.", "The last word is right");
                });
            })(UI.Tests || (UI.Tests = {}));
            var Tests = UI.Tests;
        })(GreekBible.UI || (GreekBible.UI = {}));
        var UI = GreekBible.UI;
    })(Told.GreekBible || (Told.GreekBible = {}));
    var GreekBible = Told.GreekBible;
})(Told || (Told = {}));
