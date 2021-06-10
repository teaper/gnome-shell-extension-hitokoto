/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'my-indicator-extension';
/*导入 Glib 以访问终端命令，Clutter 以直接写 css 样式*/
const { Clutter, GLib, GObject, St } = imports.gi;

const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
/*导入计时器模块*/
const Mainloop = imports.mainloop;
/*创建一个文本按钮，一个 timeout 变量，和一个计数变量 counter*/
let panelButton, panelButtonText, timeout;
/*let counter = 0;*/

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('一言短句'));

        /*创建一个按钮*/
        panelButton = new St.Bin({
            x_align: Clutter.ActorAlign.START,
            y_align: Clutter.ActorAlign.CENTER,
            style: "margin-left: 5px; left:0px;",
        });
        /*St.Label()创建一个普通文本框，text：显示的文本 style_class：按钮 CSS 样式的 class 名称 -> stylesheet.css*/
        panelButtonText = new St.Label({
            text: '世界那么大，还是遇见你',
            x_align: Clutter.ActorAlign.START,
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'examplePanelText',
        });
        /*将文本框内容添加到按钮中*/
        panelButton.set_child(panelButtonText);
        /*this 表示状态栏，直接将文本按钮添加到状态栏*/
        // this.add_child(panelButton);
        Main.panel._leftBox.add_child(panelButton);
        /**let item = new PopupMenu.PopupMenuItem(_('一言'));
        item.connect('activate', () => {
            Main.notify(_('Get 一条新短句！'));
        });
        this.menu.addMenuItem(item);*/
    }
});

/*创建修改按钮文本的方法*/
function setButtonText() {
    /*counter++;
    panelButtonText.set_text(counter.toString());*/
    
    /*通过终端命令 curl 调取一言 api 获取短句*/
    var [ok, out, err, exit] = GLib.spawn_command_line_sync('curl -s https://v1.hitokoto.cn/?encode=text');
    /*将短句进行格式化，取出尾部换行符*/
    panelButtonText.set_text(out.toString().replace(/[。.？?！!]|\n/, ''));
    return true;
}

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
        /*在开启插件的时候计时开始,1 秒运行一次*/
        timeout = Mainloop.timeout_add_seconds(10.0, setButtonText);
    }

    disable() {
        /*在禁用的时候删除超时*/
        Mainloop.source_remove(timeout);

        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}

