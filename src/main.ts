/* eslint-disable @typescript-eslint/no-empty-interface */
import * as FoldYaml from './autoFoldYAML'
import * as WorkLeaf from './workleaf'

import { AutoFoldYAML, SETTINGS as FOLD_YAML_SETTINGS, } from './autoFoldYAML';
/* eslint-disable @typescript-eslint/ban-types */
import { Editor, MarkdownView, Plugin } from 'obsidian';

import { SETTINGS as WORK_LEAF_SETTINGS } from './workleaf'
import { WorkLeafController } from './workleaf';

// Remember to rename these classes and interfaces!

declare interface SETTINGS extends FOLD_YAML_SETTINGS, WORK_LEAF_SETTINGS {
}

const DEFAULT_SETTINGS: SETTINGS = Object.assign({

}, WorkLeaf.defaultSettings, FoldYaml.defaultSettings)

declare interface CACHE {
	editor?: Editor,
	markdownview?: MarkdownView
}
export default class AutoFold extends Plugin {
	cache: CACHE;
	settings: SETTINGS;
	autoFoldYaml: FoldYaml.AutoFoldYAML;
	workLeafController: WorkLeaf.WorkLeafController;
	async onload() {
		await this.loadSettings();
		this.init()
	}
	init() {
		this.autoFoldYaml = new AutoFoldYAML(this)
		this.workLeafController = new WorkLeafController(this)
	}
	async onunload() {
		await this.saveSettings();
		this.autoFoldYaml.die()
		this.workLeafController.die()
	}
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}