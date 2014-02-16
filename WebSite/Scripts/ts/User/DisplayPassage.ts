﻿/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../Support/Colors.ts" />
/// <reference path="MainViewModel.ts" />

module Told.GreekBible.UI {

    export class MainViewModel_DisplayPassage {

        private viewModel: MainViewModel;

        constructor(viewModel: MainViewModel) {
            this.viewModel = viewModel;
        }


        static getUniqueColorA = Colors.createGetUniqueColor(150, 150);
        static getUniqueColorB = Colors.createGetUniqueColor(175, 175);

        getColorA(text: string): string {
            return MainViewModel_DisplayPassage.getUniqueColorA(text);
        }

        getColorB(text: string): string {
            return MainViewModel_DisplayPassage.getUniqueColorB(text);
        }
        
    }

}