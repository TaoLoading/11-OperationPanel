import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { DrawerService, IDrawerOpenResult } from 'ng-devui/drawer';
import { DashboardWidget } from 'ng-devui/dashboard';
import { ToastService } from 'ng-devui/toast';
import { DialogService } from 'ng-devui/modal';
import { CreatePluginComponent } from './create-plugin/create-plugin.component'
import { SearchPluginComponent } from './search-plugin/search-plugin.component'

@Component({
  selector: 'app-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.scss'],
})
export class SampleComponent implements OnInit, AfterViewInit {
  @ViewChild('drawerContent', { static: true }) drawerContent: TemplateRef<any>;
  @ViewChild('pluginDrawerContent', { static: true }) pluginDrawerContent: TemplateRef<any>;
  results: IDrawerOpenResult;
  resultsLook: IDrawerOpenResult;
  // 插件抽屉数据
  selectList = [
    {
      name: '超长会话',
      value: 'sessionTime>=7200000',
      check: false
    },
    {
      name: '请求流量大于响应流量',
      value: 'bytes.in>bytes.out',
      check: false
    },
    {
      name: '外联流量大于内联流量',
      value: 'bytes.out>bytes.in',
      check: false
    },
    {
      name: '80端口非HTTP协议',
      value: 'port==80&&proto.appProto!=HTTP',
      check: false
    },
    {
      name: '连入流量等于连出流量',
      value: 'bytes.in==bytes.out',
      check: false
    }
  ];
  // 存放查询数据的数组
  searchArr = [];
  // 大屏模块数据
  widgets: Array<DashboardWidget> = [];
  falseWidgets: Array<DashboardWidget> = [
    {
      x: 0,
      y: 0,
      width: 2,
      height: 1,
      locked: true,
      flag: 0
    },
    {
      x: 2,
      y: 0,
      width: 2,
      height: 1,
      locked: true,
      flag: 1
    },
    {
      x: 4,
      y: 0,
      width: 2,
      height: 1,
      locked: true,
      flag: 2
    },
    {
      x: 6,
      y: 0,
      width: 2,
      height: 1,
      locked: true,
      flag: 3
    },
    {
      x: 8,
      y: 0,
      width: 2,
      height: 1,
      locked: true,
      flag: 4
    },
    {
      x: 10,
      y: 0,
      width: 2,
      height: 1,
      locked: true,
      flag: 5
    }
  ];
  // 是否可编辑模块
  canEditor: boolean = false;
  // 图表1的宽高
  width: number = 0;
  height: number = 0;
  constructor(private drawerService: DrawerService, private toastService: ToastService, private dialogService: DialogService) { }

  ngOnInit(): void {
    // 从localStorage中读取仪表盘布局
    this.widgets = JSON.parse(localStorage.getItem('widgets'));
    if (!this.widgets) {
      this.widgets = this.falseWidgets;
      this.toastService.open({
        value: [{ severity: 'info', summary: '当前仪表盘布局数据为假数据' }],
      });
    } else {
      this.toastService.open({
        value: [{ severity: 'success', summary: '当前仪表盘布局数据为localStorage中的数据' }],
      });
    }
  }

  ngAfterViewInit(): void {
    window.dispatchEvent(new Event('resize'));
  }

  // 打开快捷查询抽屉
  openDrawer() {
    this.results = this.drawerService.open({
      width: '300px',
      zIndex: 1000,
      isCover: true,
      fullScreen: true,
      backdropCloseable: true,
      escKeyCloseable: true,
      position: 'left',
      onClose: () => { },
      contentTemplate: this.drawerContent
    });
  }

  // 关闭快捷查询抽屉
  close($event) {
    this.results.drawerInstance.hide();
  }

  // 插件内容点击
  selectItemChange(val) {
    if (val.check) {
      this.searchArr.push(val.value);
    } else {
      this.searchArr.splice(this.searchArr.indexOf('val.value'), 1);
    }
    let searchContext = '';
    for (let index = 0; index < this.searchArr.length; index++) {
      const element = this.searchArr[index];
      if (searchContext === '') {
        searchContext = element;
      } else {
        searchContext += '||' + element;
      }
    }
    this.toastService.open({
      value: [{ severity: 'success', summary: '当前搜索条件为', content: searchContext }],
    });
  }

  // 编辑模块
  editorWidget() {
    this.toastService.open({
      value: [{ severity: 'success', summary: '拖动模块实现页面自定义' }],
    });
    this.canEditor = true;
    for (let index = 0; index < this.widgets.length; index++) {
      const element = this.widgets[index];
      delete element['locked'];
    }
  }

  // 保存编辑
  saveEditor() {
    this.canEditor = false;
    for (let index = 0; index < this.widgets.length; index++) {
      const element = this.widgets[index];
      element['locked'] = true;
    }
    // 存储当前布局到localStorage
    localStorage.setItem('widgets', JSON.stringify(this.widgets))
  }

  // 增加模块
  addWidget() {
    this.widgets.push({ width: 2, height: 1 });
  }

  // 删除模块
  deleteWidget(i) {
    if (i < 0 || i >= this.widgets.length) {
      return;
    }
    this.widgets.splice(i, 1);
  }

  // 打开添加插件弹窗
  openCreatePlugin(dialogtype?: string) {
    const results = this.dialogService.open({
      id: 'dialog-service',
      width: '346px',
      maxHeight: '600px',
      title: '添加插件',
      content: CreatePluginComponent,
      backdropCloseable: true,
      dialogtype: dialogtype,
      onClose: () => { },
      buttons: [
        {
          cssClass: 'primary',
          text: '确定',
          disabled: false,
          handler: ($event: Event) => {
            results.modalInstance.hide();
          },
        },
        {
          id: 'btn-cancel',
          cssClass: 'common',
          text: '取消',
          handler: ($event: Event) => {
            results.modalInstance.hide();
          },
        },
      ]
    })
  }

  // 渲染图表
  widgetInit() {
    const chart = document.getElementsByClassName("widget")[0].children[0].children[0];
    this.width = chart.parentElement.offsetWidth;
    this.height = chart.parentElement.offsetHeight;
  }

  // 打开查看插件抽屉
  openLookPlugin() {
    this.results = this.drawerService.open({
      drawerContentComponent: SearchPluginComponent,
      width: '300px',
      zIndex: 1000,
      isCover: true,
      fullScreen: true,
      backdropCloseable: true,
      escKeyCloseable: true,
      position: 'left',
      onClose: () => { },
      data: {
        text: 'hello',
        name: 'tom1',
        close: (event) => {
          this.results.drawerInstance.hide();
        },
        fullScreen: (event) => {
          this.results.drawerInstance.toggleFullScreen();
        }
      }
    })
  }
}
