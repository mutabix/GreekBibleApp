﻿/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../Support/AccessUserSettings.ts" />
/// <reference path="000_MainViewModel.ts" />
/// <reference path="../Support/LoadPassageText.ts" />
/// <reference path="../Support/ParsePassageText.ts" />

module Told.GreekBible.UI {

    export class MainViewModel_DisplayPassage {

        private viewModel: MainViewModel;

        private get userSettings() { return this.viewModel.providers.userSettings; }
        private get minTimeForLoadingMessage() { return this.viewModel.providers.config.minTimeForLoadingMessage; }

        constructor(viewModel: MainViewModel) {
            this.viewModel = viewModel;
            this.showDefault();
        }


        passageRaw = ko.observable<Data.IPassage>(null);
        passageVisible = ko.observable<IPassageVersesUI>(null);

        book = ko.observable<string>(null);
        chapter = ko.observable<number>(null);
        verse = ko.observable<number>(null);

        hasPassageLoadingFailed = ko.observable<boolean>(false);

        showDefault(onLoad?: () => void, onError?: (message: string) => void) {
            // TODO: Load Last Passage (local Storage)

            var lastBook = parseInt(this.userSettings.bookChoice);
            var lastChapter = parseInt(this.userSettings.chapterChoice);
            var lastVerse = parseInt(this.userSettings.verseChoice);

            if (isNaN(lastBook) || isNaN(lastChapter) || isNaN(lastVerse)) {
                lastBook = 1;
                lastChapter = 1;
                lastVerse = 1;
            }

            this.showPassage(lastBook, lastChapter, lastVerse, onLoad, onError);
        }

        showPassage(bookNumber: number, chapter: number, verse: number, onLoad?: () => void, onError?: (message: string) => void) {

            var self = this;

            // Set choice
            this.userSettings.bookChoice = bookNumber.toString();
            this.userSettings.chapterChoice = chapter.toString();
            this.userSettings.verseChoice = verse.toString();

            // if same book and chapter, then change visibility only
            if (self.isPassageLoaded()
                && self.book() === Data.BookInfo.getBookName(bookNumber)
                && self.chapter() === chapter) {

                self.verse(verse);

                self.passageVisible({ verses: [], allEntries: [] });
                self.passageVisible(self.getPassageVisible());

                // Make sure it is loaded before calling load
                var checkForLoaded = function () {
                    if (self.isPassageLoaded()) {
                        if (onLoad) { onLoad(); }
                    } else {
                        setTimeout(checkForLoaded, 100);
                    }
                };

                checkForLoaded();


                return;
            }


            // Make Blank while waiting
            self.passageRaw({ entries: [] });
            self.passageVisible({ verses: [], allEntries: [] });
            self.hasPassageLoadingFailed(false);

            self.book(Data.BookInfo.getBookName(bookNumber));
            self.chapter(chapter);
            self.verse(verse);

            // Ensure this call is made async to give a change for UI to update
            setTimeout(() => {
                Data.Loader.loadPassage(bookNumber, chapter,
                    function (passageText: string) {

                        // Ensure loading message can display to prevent flicker
                        setTimeout(() => {
                            // Ensure that this was the last chosen passage
                            if (bookNumber === Data.BookInfo.getBookNumber(self.book())
                                && chapter === self.chapter()
                                && verse === self.verse()) {

                                self.passageRaw(Data.Parser.parsePassage(passageText));
                                self.passageVisible(self.getPassageVisible());

                                if (onLoad) { onLoad(); }

                            }
                        }, self.minTimeForLoadingMessage);

                    }, function (errorMessage: string) {
                        self.hasPassageLoadingFailed(true);
                        if (onError) { onError(errorMessage); }
                    });
            }, 0);
        }

        isPassageLoaded = ko.computed<boolean>({
            read: function () {
                var passage = <IPassageVersesUI> this.passageVisible();
                return passage != null && passage.verses != null && passage.verses.length > 0;
            },
            owner: this,
            deferEvaluation: true
        });

        isPassageLoading = ko.computed<boolean>({
            read: function () {
                return !this.isPassageLoaded() && !this.hasPassageLoadingFailed();
            },
            owner: this,
            deferEvaluation: true
        });

        private _contextVerseCount = 1;

        getPassageVisible(): IPassageVersesUI {
            var self = <MainViewModel_DisplayPassage> this;

            var passageChapter = <IPassageUI> self.passageRaw();

            var verseNum = self.verse();
            var entriesVerse = passageChapter.entries.filter(e=> e.passageRef.verse >= verseNum - self._contextVerseCount && e.passageRef.verse <= verseNum + self._contextVerseCount);
            var passageVerse = { entries: entriesVerse };

            var passageFormatted = self.viewModel.displayEntryColorCoding.formatPassage(passageVerse);
            var passageFormatted = self.viewModel.displayEntryDetails.formatPassage(passageFormatted);

            // Group in verses
            var verses: IVerseUI[] = [];

            for (var i = 0; i < entriesVerse.length; i++) {
                var entry = entriesVerse[i];

                var versesMatch: IVerseUI[] = verses.filter(v=>
                    v.passageRef.bookNumber === entry.passageRef.bookNumber
                    && v.passageRef.chapter === entry.passageRef.chapter
                    && v.passageRef.verse === entry.passageRef.verse
                    );
                var verse = versesMatch.length > 0 ? versesMatch[0] : null;

                if (verse === null) {
                    verses.push({
                        passageRef: entry.passageRef,
                        verseWrapperClassName: entry.passageRef.verse === verseNum ? "verseWrapperMain" : "verseWrapperContext",
                        entries: [],
                    });

                    verse = verses[verses.length - 1];
                }

                verse.entries.push(entry);
            }

            return { verses: verses, allEntries: entriesVerse };
        }

    }

    ko.bindingHandlers["removeSpace"] = {
        init: function (element, valueAccessor, allBindings) {
            $(element).contents().filter(function () { return this.nodeType === 3; }).remove();
        },
        update: function (element, valueAccessor, allBindings) {
            $(element).contents().filter(function () { return this.nodeType === 3; }).remove();
        }
    };

    ko.bindingHandlers["hideExtraContext"] = {
        init: function (element, valueAccessor, allBindings) {



        },
        update: function (element, valueAccessor, allBindings) {

            var mainEntries = $(element).children().filter(function () { return $(this).hasClass("verseWrapperMain") }).children();
            var contextEntries = $(element).children().filter(function () { return $(this).hasClass("verseWrapperContext") }).children();

            var mPosFirst = mainEntries.first().offset().top;
            var mPosLast = mainEntries.last().offset().top;

            var toHide = contextEntries.filter(function () {
                var ePos = $(this).offset().top;
                return ePos < mPosFirst || ePos > mPosLast;
            });

            toHide.hide();
        }
    };

}