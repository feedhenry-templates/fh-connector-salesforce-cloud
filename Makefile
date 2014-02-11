PACKAGE = fh-connector-salesforce-cloud

all: clean docs preview

# assumes aglio installed globally for now..
docs: 
	aglio -i README.md -o docs/index.html

# live preview, handy for writing the docs
preview:
	aglio -i README.md --server

clean:
	rm docs/*

.PHONY: clean docs preview
