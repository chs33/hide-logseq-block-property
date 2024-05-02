import { Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext, App } from 'obsidian';

class HideTextPluginSettingTab extends PluginSettingTab {
  plugin: HideTextPlugin;

  constructor(app: App, plugin: HideTextPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Regular Expression')
      .setDesc('Enter the regular expression pattern to match text to hide')
      .addText((text) =>
        text
          .setPlaceholder('/(?<!`)(id::\\d+)(?!`)/g')
          .setValue(this.plugin.settings.regex)
          .onChange(async (value) => {
            this.plugin.settings.regex = value;
            await this.plugin.saveSettings();
          })
      );
  }
}

export default class HideTextPlugin extends Plugin {
  settings: {
    regex: string;
  };

  async onload() {
    await this.loadSettings();
    this.registerMarkdownPostProcessor(this.hideTextPostProcessor);
    this.addSettingTab(new HideTextPluginSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, {
      regex: '/(?<!`)(id::\\d+)(?!`)/g',
    }, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  hideTextPostProcessor = (
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ) => {
    const regex = new RegExp(this.settings.regex, 'g');
    el.innerHTML = el.innerHTML.replace(regex, (match, p1) => {
      return `<span class="hidden-text">${p1}</span>`;
    });
  };
}