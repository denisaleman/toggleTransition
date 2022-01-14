.DEFAULT_GOAL := help

help:
	@echo ""
	@echo "Available tasks:"
	@echo "    lint     Run linter and code style checker"
	@echo "    test     Run linter and tests"
	@echo "    install  Install dependencies"
	@echo "    build    Build minified version"
	@echo "    docs     Generate docs"
	@echo "    todo     Parse and generate TODO-s.md"
	@echo "    all      Install dependencies and run linter and tests"
	@echo ""

install:
	npm install

lint:
	npx eslint --fix toggleTransition.js

test: 
	make --no-print-directory lint && npm test 

build:
	npm run todo
	npx uglifyjs toggleTransition.js --compress --mangle --source-map --output toggleTransition.min.js
	sed -i "1s/^/\/*! toggleTransition v0.9.0 - MIT license - Copyright 2007-2022 Denis Alemán *\/\n/" toggleTransition.min.js

docs:
	rm -rf ./docs && npm run generate-docs

todo:
	npm run todo

all: install test build

.PHONY: help install lint test build docs todo all