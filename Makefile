PACKAGE = fh-connector-salesforce-cloud

all: clean docs preview

# assumes aglio installed globally for now..
docs: 
	aglio -i README.md -o docs/readme.html

# live preview, handy for writing the docs
preview:
	aglio -i README.md --server

.PHONY: clean docs preview
