/* eslint-disable prefer-const */

import AutoFold from "./main";
import { Notice } from "obsidian";
import { Switch } from './consisit';

export declare interface SETTINGS {
    autoFoldLeftLeaf: Switch
}
export const defaultSettings: SETTINGS = {
    autoFoldLeftLeaf: 1
}

class WorkLeaf {
    protected _plugin: AutoFold;
    constructor(plugin: AutoFold) {
        this._plugin = plugin;
    }
    /** 顶层入口api */
    closeLeft() {
        // new Notice(Switch[this._plugin.settings.autoFoldLeftLeaf])
        let cancel = !this._plugin.settings.autoFoldLeftLeaf || this._plugin.app.workspace.leftSplit.collapsed
        if (cancel) return;
        this.toggleLeftMod();
        this.focusEditor();
    }
    toggleLeftMod() {
        let app = this._plugin.app;
        //@ts-ignore
        app.commands.executeCommandById('app:toggle-left-sidebar');
    }
    focusEditor() {
        let app = this._plugin.app;
        //@ts-ignore
        app.commands.executeCommandById('editor:focus');
    }
}
export class WorkLeafController extends WorkLeaf {
    constructor(plugin: AutoFold) {
        super(plugin)
        this.Init()
    }
    protected addCommand() {
        this._plugin.addCommand({
            id: 'switch auto fold left leaf',
            name: '关闭/开启/切换/Switch 自动折叠左边栏',
            callback: () => {
                WorkLeafController.switchAutoFoldLeftLeaf(this._plugin)
            }
        });
    }
    static switchAutoFoldLeftLeaf(plugin: AutoFold) {
        plugin.settings.autoFoldLeftLeaf = (plugin.settings.autoFoldLeftLeaf + 1) % 2
        plugin.saveSettings()
        new Notice("自动折叠左边栏：" + Switch[plugin.settings.autoFoldLeftLeaf])
    }
    protected _leftMod: HTMLElement | null;
    Init() {
        this.addCommand()
        this.regist();
    }
    protected setLeftMod(css = '.workspace-split.mod-horizontal.mod-left-split') {
        this._leftMod = document.querySelector(css);
    }
    protected regist() {
        if (!this._leftMod) {
            window.setTimeout(() => {
                this.setLeftMod();
                this.regist();
            }, 3000)
            return;
        }
        this.removeLis()
        this.keyHandle = this.keyHandle.bind(this)
        this.fileOpenHandler = this.fileOpenHandler.bind(this)
        this._leftMod.addEventListener('keyup', this.keyHandle);
        this._plugin.app.workspace.on('file-open', this.fileOpenHandler);
    }
    removeLis() {
        this._leftMod?.removeEventListener('keyup', this.keyHandle);
        this._plugin.app.workspace.off('file-open', this.fileOpenHandler);
    }
    protected fileOpenHandler() {
        this.closeLeft()
    }
    protected keyHandle(ev: KeyboardEvent) {
        // Testlog(ev.key);
        if (ev.key == 'Escape') {
            this.closeLeft()
        }
    }
    die() {
        this.removeLis()
    }
}