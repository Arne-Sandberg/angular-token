import { Http, BaseRequestOptions, Response, ResponseOptions, Headers, RequestMethod } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { provide } from '@angular/core';
import { inject, addProviders } from '@angular/core/testing';
import { ActivatedRoute, RouterOutletMap, RouterState } from '@angular/router';

import { Angular2TokenService } from './';

describe('Angular2TokenService', () => {

	// Init common test data
	let tokenType = 'Bearer';
	let uid = 'test@test.com';
	let accessToken = 'fJypB1ugmWHJfW6CELNfug';
	let client = '5dayGs4hWTi4eKwSifu_mg';
	let expiry = '1472108318';

	let emptyHeaders = new Headers({
		'content-Type': 'application/json'
	});
	let tokenHeaders = new Headers({
		'content-Type': 'application/json',
		'token-type': tokenType,
		'uid': uid,
		'access-token': accessToken,
		'client': client,
		'expiry': expiry
	});

	let signInData = {
		email: 'test@test.de',
		password: 'password'
	}

	let registerData = {
		email: 'test@test.de',
		password: 'password',
		password_confirmation: 'password',
		confirm_success_url: window.location.href
	}

	class Mock { }

	beforeEach(() => {
		// Inject HTTP and Angular2TokenService
		addProviders([
			BaseRequestOptions,
			MockBackend,
			{ provide: ActivatedRoute, useClass: Mock },
			{
				provide: Http,
				useFactory: (backend, defaultOptions) => { return new Http(backend, defaultOptions) },
				deps: [MockBackend, BaseRequestOptions]
			},
			Angular2TokenService
		]);

		// Fake Local Storage
		var store = {};

		spyOn(localStorage, 'getItem').and.callFake((key: string): String => {
			return store[key] || null;
		});
		spyOn(localStorage, 'removeItem').and.callFake((key: string): void => {
			delete store[key];
		});
		spyOn(localStorage, 'setItem').and.callFake((key: string, value: string): string => {
			return store[key] = <string>value;
		});
		spyOn(localStorage, 'clear').and.callFake(() => {
			store = {};
		});
	});

	// Testing Default Configuration

	it('signIn method should post data to default url', inject([Angular2TokenService, MockBackend], (tokenService, mockBackend) => {

		mockBackend.connections.subscribe(
			c => {
				expect(c.request.getBody()).toEqual(JSON.stringify(signInData));
				expect(c.request.method).toEqual(RequestMethod.Post);
				expect(c.request.url).toEqual('auth/sign_in');
			}
		);

		tokenService.init();
		tokenService.signIn(signInData.email, signInData.password);
	}));

	it('signOut method should delete to default url', inject([Angular2TokenService, MockBackend], (tokenService, mockBackend) => {

		mockBackend.connections.subscribe(
			c => {
				expect(c.request.method).toEqual(RequestMethod.Delete);
				expect(c.request.url).toEqual('auth/sign_out');
			}
		);

		tokenService.init();
		tokenService.signOut();
	}));

	it('registerAccount should post data to default url', inject([Angular2TokenService, MockBackend], (tokenService, mockBackend) => {

		mockBackend.connections.subscribe(
			c => {
				expect(c.request.getBody()).toEqual(JSON.stringify(registerData));
				expect(c.request.method).toEqual(RequestMethod.Post);
				expect(c.request.url).toEqual('auth');
			}
		);

		tokenService.init();
		tokenService.registerAccount(registerData.email, registerData.password, registerData.password_confirmation);
	}));

	// Testing Custom Configuration

	it('Methods should send to configured path', inject([Angular2TokenService, MockBackend], (tokenService, mockBackend) => {

		mockBackend.connections.subscribe(
			c => expect(c.request.url).toEqual('myapi/myauth/mysignin')
		);

		tokenService.init({ apiPath: 'myapi', signInPath: 'myauth/mysignin' });
		tokenService.signIn(signInData.email, signInData.password);
	}));

	it('signOut should send to configured path', inject([Angular2TokenService, MockBackend], (tokenService, mockBackend) => {

		mockBackend.connections.subscribe(
			c => expect(c.request.url).toEqual('myapi/myauth/mysignout')
		);

		tokenService.init({ apiPath: 'myapi', signOutPath: 'myauth/mysignout' });
		tokenService.signOut();
	}));

	it('registerAccount should send to configured path', inject([Angular2TokenService, MockBackend], (tokenService, mockBackend) => {

		mockBackend.connections.subscribe(
			c => expect(c.request.url).toEqual('myapi/myauth/myregister')
		);

		tokenService.init({ apiPath: 'myapi', registerAccountPath: 'myauth/myregister' });
		tokenService.registerAccount('example@example.org', 'password', 'password');
	}));

	it('deleteAccount should send to configured path', inject([Angular2TokenService, MockBackend], (tokenService, mockBackend) => {

		mockBackend.connections.subscribe(
			c => expect(c.request.url).toEqual('myapi/myauth/mydelete')
		);

		tokenService.init({ apiPath: 'myapi', deleteAccountPath: 'myauth/mydelete' });
		tokenService.deleteAccount();
	}));

	it('validateToken should send to configured path', inject([Angular2TokenService, MockBackend], (tokenService, mockBackend) => {

		mockBackend.connections.subscribe(
			c => expect(c.request.url).toEqual('myapi/myauth/myvalidate')
		);

		tokenService.init({ apiPath: 'myapi', validateTokenPath: 'myauth/myvalidate' });
		tokenService.validateToken();
	}));

	it('updatePasswordPath should send to configured path', inject([Angular2TokenService, MockBackend], (tokenService, mockBackend) => {

		mockBackend.connections.subscribe(
			c => expect(c.request.url).toEqual('myapi/myauth/myupdate')
		);

		tokenService.init({ apiPath: 'myapi', updatePasswordPath: 'myauth/myupdate' });
		tokenService.updatePassword('password', 'password');
	}));

	it('resetPasswordPath should send to configured path', inject([Angular2TokenService, MockBackend], (tokenService, mockBackend) => {

		mockBackend.connections.subscribe(
			c => expect(c.request.url).toEqual('myapi/myauth/myreset')
		);

		tokenService.init({ apiPath: 'myapi', resetPasswordPath: 'myauth/myreset' });
		tokenService.resetPassword('emxaple@example.org');
	}));

	// Testing Token handling

	it('signIn method should receive headers and set local storage', inject([Angular2TokenService, MockBackend], (tokenService, mockBackend) => {

		mockBackend.connections.subscribe(
			c => c.mockRespond(new Response(
				new ResponseOptions({
					headers: tokenHeaders,
					body: { email: 'test@email.com' }
				})
			))
		);

		tokenService.init();
		tokenService.signIn(signInData.email, signInData.password);

		expect(localStorage.getItem('accessToken')).toEqual(accessToken);
		expect(localStorage.getItem('client')).toEqual(client);
		expect(localStorage.getItem('expiry')).toEqual(expiry);
		expect(localStorage.getItem('tokenType')).toEqual(tokenType);
		expect(localStorage.getItem('uid')).toEqual(uid);
	}));

	it('signOut method should clear local storage', inject([Angular2TokenService, MockBackend], (tokenService, mockBackend) => {
		localStorage.setItem('token-type', tokenType);
		localStorage.setItem('uid', uid);
		localStorage.setItem('access-token', accessToken);
		localStorage.setItem('client', client);
		localStorage.setItem('expiry', expiry);

		mockBackend.connections.subscribe(
			c => expect(c.request.method).toEqual(RequestMethod.Delete)
		);

		tokenService.init();
		tokenService.signOut();

		expect(localStorage.getItem('accessToken')).toBe(null);
		expect(localStorage.getItem('client')).toBe(null);
		expect(localStorage.getItem('expiry')).toBe(null);
		expect(localStorage.getItem('tokenType')).toBe(null);
		expect(localStorage.getItem('uid')).toBe(null);
	}));

});
