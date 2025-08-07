Feature: Browse Tigera Docs
  As a user, I want to verify the main product boxes on the Tigera documentation homepage

  Scenario: Homepage displays product boxes
    Given I browse to "https://docs.tigera.io"
    When the page has loaded
    Then I should see a box for "Calico Open Source"
    And I should see a box for "Enterprise"
    And I should see a box for "Cloud"
