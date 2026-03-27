# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a **DynamicTodo widget plugin for SiYuan Note**, a kanban-style todo list that stores data in the widget's block attributes.

## Architecture
- **Entry point**: `index.html` - loads all dependencies and renders the UI
- **Core logic**:
  - `script/style.js`: Main application logic, UI rendering, drag-and-drop, task CRUD operations
  - `script/api.js`: SiYuan API interactions, data persistence (read/write block attributes)
  - `script/util.js`: Utility helper functions
  - `script/config.js`: Configuration constants
- **Styles**: `style.css` - all UI styling
- **Dependencies**:
  - jQuery (from `static/jquery.min.js`)
  - marked.js (from `static/marked_4.1.0_marked.min.js`) for markdown rendering
- **Data storage**: All task data is stored in the widget's block attributes, see `sample.json` for data structure reference.

## Common Commands
This is a pure frontend project with **no build/compile steps required**:
1. **Development**: Directly edit the source files, no transpilation needed
2. **Testing**: Load the widget in SiYuan to test changes
3. **Deployment**: Copy all repository files to SiYuan's widget directory

## Important Notes
- Data is stored as widget block attributes, if the widget crashes, reference `sample.json` to manually fix corrupted data
- Markdown is supported in task descriptions, only allow http/https links and SiYuan internal links
- Task panels are draggable, tasks support drag-and-drop between status columns
