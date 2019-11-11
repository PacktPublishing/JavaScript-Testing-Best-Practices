Feature: Resizer results in smaller size
    Using the resizer should result in smaller file size

    Scenario: Using sample image 1
        Given The source file "html5_logo.png"
        And The destination file "html5_logo-half.png"
        When We resize the source file
        Then The destination file should be smaller