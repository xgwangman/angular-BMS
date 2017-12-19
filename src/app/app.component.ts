import { Component, HostListener, ElementRef, Renderer, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import { UserLoginService } from './user/user-login/user-login.service';
import { UserRegisterService } from './user/user-register/user-register.service';
import { User } from './user/model/user-model';
import 'rxjs/add/operator/merge';
import { Message } from 'primeng/primeng';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	public msgs: Message[] = [];
	public currentUser: User;
	private globalClickCallbackFn: Function;
	private loginSuccessCallbackFn: Function;

	constructor(
		public elementRef: ElementRef,
		public renderer: Renderer,
		public router: Router,
		public activatedRoute: ActivatedRoute,
		public translate: TranslateService,
		public userLoginService: UserLoginService,
		public userRegisterService: UserRegisterService
	) {

	}

	ngOnInit() {
		this.globalClickCallbackFn = this.renderer.listen(this.elementRef.nativeElement, 'click', (event: any) => {
			console.log("全局监听点击事件>" + event);
		});

		this.currentUser = JSON.parse(localStorage.getItem("currentUser"));

		this.userLoginService.currentUser
			.merge(this.userRegisterService.currentUser)
			.subscribe(
			data => {
				this.currentUser = data;
				let activatedRouteSnapshot: ActivatedRouteSnapshot = this.activatedRoute.snapshot;
				let routerState: RouterState = this.router.routerState;
				let routerStateSnapshot: RouterStateSnapshot = routerState.snapshot;

				console.log(activatedRouteSnapshot);
				console.log(routerState);
				console.log(routerStateSnapshot);

				//如果是从/login这个URL进行的登录，跳转到首页，否则什么都不做
				if (routerStateSnapshot.url.indexOf("/login") != -1) {
					this.router.navigateByUrl("/home");
				}
			},
			error => console.error(error)
			);

		//ng2-translate国际化服务相关的配置
		this.translate.addLangs(["zh", "en"]);
		this.translate.setDefaultLang('zh');
		const browserLang = this.translate.getBrowserLang();
		this.translate.use(browserLang.match(/zh|en/) ? browserLang : 'zh');
		
		//点击导航每一项后隐藏导航
		$('.dropdown').click(function(){
			$('.hided').slideToggle(600);
		});
	}

	ngOnDestroy() {
		if (this.globalClickCallbackFn) {
			this.globalClickCallbackFn();
		}
	}

	public doLogout(): void {
		this.userLoginService.logout();
		this.msgs = [];
        this.msgs.push({severity:'success', summary:'Success Message', detail:'退出成功'});
		this.router.navigateByUrl("");
	}
}