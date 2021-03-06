﻿Feature: 002 - Choose a Greek Passage
As a user,
I can choose which passage to display
So that I can read a certain greek passage 


Scenario: should display loading after choosing passage

	When user chooses a passage
	Then the user should see that a passage is loading
    And the loading message should display briefly


Scenario: should display chosen passage

	Given user chooses a passage
	When the passage is loaded
	Then the first entry should be displayed
	And the last entry should be displayed


Scenario: should display last chosen passage
	If the user chooses two passages quickly, it should display the last chosen passage

	Given user chooses two passages quickly
	When the passage is loaded
	Then the last chosen passage should be displayed

