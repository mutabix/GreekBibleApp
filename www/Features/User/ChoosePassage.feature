﻿Feature: Choose a Greek Passage
As a user,
I can choose which passage to display
So that I can read a certain greek passage 


Scenario: should display last chosen passage
	If the user chooses two passages quickly, it should display the last chosen passage

	Given user chooses two passages quickly
	When the passage is loaded
	Then the last chosen passage should be displayed
