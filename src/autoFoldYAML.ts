/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prefer-const */

import { Editor, MarkdownView, Notice, debounce } from 'obsidian';

import AutoFold from './main';
import { Switch } from './consisit';
import { pollObj } from 'enhanced-dom';

export declare interface SETTINGS {
    autoFoldYAML: Switch
}

export declare interface TIMER {
    DebounceOfFoldYAML: Function | null
}


export const defaultSettings: SETTINGS = {
    autoFoldYAML: 1
}

export class AutoFoldYAML {
    //目前存在的bug:
    //1. 不能加载保存的设置配置文件, obsidian api的锅, 只能等更新了
    plugin: AutoFold;
    timer: TIMER;
    constructor(plugin: AutoFold) {
        this.plugin = plugin
        this.Init()
    }
    Init() {
        this.timer = {
            DebounceOfFoldYAML: null
        }
        this.addCommand()
        this.register()
    }
    register() {
        this.removeListener()
        this.timer.DebounceOfFoldYAML = debounce(this.handle.bind(this), 50, true);
        //this.plugin.Timer.DebounceOfFoldYAML = this.handle.bind(this);
        this.removeListener()
        //@ts-ignore
        this.plugin.app.workspace.on('file-open', this.timer.DebounceOfFoldYAML)
    }
    die() {
        this.removeListener()
    }
    removeListener() {
        //@ts-ignore
        this.plugin.app.workspace.off('file-open', this.timer.DebounceOfFoldYAML)
    }
    async handle() {
        //console.log('autofold:', this.plugin.settings.autoFoldYAML)
        if (!this.plugin.settings.autoFoldYAML) return;
        //await Kit.sleep(100);
        await this.FoldYAML();
    }
    async FoldYAML() {
        let obj = await this.getFoldButton()
        if (!obj) {
            console.log('No Button!');
            return;
        }
        this.click(obj);
    }
    async getFoldButton() {

        let yamlobj = await pollObj('.workspace-leaf.mod-active .cm-def.cm-hmd-frontmatter');
        if (!yamlobj) return;
        let obj: HTMLElement | null = null;
        for (let o = yamlobj.previousElementSibling; o; o = o.previousElementSibling) {
            // console.log(o.getAttribute('class'))
            if (o.getAttribute('class') == 'cm-fold-indicator') obj = o as HTMLElement;
        }
        return obj;
    }
    click(obj: HTMLElement) {
        let evt = new MouseEvent('click')
        obj.dispatchEvent(evt);
        // console.log('Click!');
    }
    addCommand() {
        this.plugin.addCommand({
            id: '切换自动折叠YAML',
            name: '切换Switch自动折叠YAML',
            editorCallback: async (editor: Editor, view: MarkdownView) => {
                this.plugin.cache.editor = editor;
                this.plugin.cache.markdownview = view;
                await this.plugin.saveSettings()
                await this.switchAuto()
            }
        });
    }
    async switchAuto() {
        this.plugin.settings.autoFoldYAML = (this.plugin.settings.autoFoldYAML + 1) % 2
        await this.plugin.saveSettings()
        new Notice('Now auto fold YAML:' + Switch[this.plugin.settings.autoFoldYAML]);
    }
}
