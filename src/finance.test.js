import test from 'node:test';
import assert from 'node:assert/strict';
import { compound, savingsMonths, mortgage, presentValue } from './finance.js';
const near = (a,b) => assert.ok(Math.abs(a-b)<0.001, `${a} != ${b}`);
test('compound interest and zero rate', () => { near(compound(10000,.05,10,1),16288.946267); assert.equal(compound(10000,0,10),10000); });
test('monthly savings rounds up and handles unreachable targets', () => { assert.equal(savingsMonths(1000,100,0,1250),3); assert.equal(savingsMonths(1000,100,0,1200),2); assert.equal(savingsMonths(1000,0,0,2000),Infinity); assert.equal(savingsMonths(0,0,.05,2000),Infinity); assert.equal(savingsMonths(2000,0,0,1000),0);const months=savingsMonths(10000,2000,.03,100000);const balance=n=>10000*(1+.03/12)**n+2000*((1+.03/12)**n-1)/(.03/12);assert.ok(balance(months)>=100000);assert.ok(balance(months-1)<100000); });
test('mortgage annuity schedule balances and equal capital reduces payment', () => { const loan=mortgage(1000000,.035,30);near(loan.payment,4490.446878);assert.equal(loan.rows.length,360);near(loan.rows.at(-1).remaining,0);near(loan.rows.reduce((s,r)=>s+r.capital,0),1000000);near(loan.total,loan.payment*360);const equal=mortgage(1000000,.035,30,'equal');assert.ok(equal.rows[0].payment>equal.rows.at(-1).payment);assert.ok(equal.total<loan.total);near(equal.rows.at(-1).remaining,0); });
test('zero rate mortgage and present value', () => {near(mortgage(120000,0,10).payment,1000);near(mortgage(120000,0,10).total,120000);near(presentValue(100000,.05,10),61391.325354);assert.equal(presentValue(100000,0,10),100000); });
