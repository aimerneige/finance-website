import test from 'node:test';
import assert from 'node:assert/strict';
import { compound, savingsMonths, mortgage, presentValue } from './finance.js';
const near = (a,b) => assert.ok(Math.abs(a-b)<0.001, `${a} != ${b}`);
test('compound interest and zero rate', () => { near(compound(10000,.05,10,1),16288.946267); assert.equal(compound(10000,0,10),10000); });
test('monthly and annual investments occur at the end of each period', () => {
  near(compound(1000,.12,1,12,100,12), 2395.0753314517);
  near(compound(1000,.1,2,1,100,1), 1420);
  near(compound(1000,.1,2,1,100,12), compound(1000,.1,2,1) + 100 * ((1.1**2-1)/(1.1**(1/12)-1)));
  assert.equal(compound(1000,0,2,12,100,12),3400);
  assert.equal(compound(1000,0,2,12,100,1),1200);
});
test('signed investment amounts, principal and negative rates', () => {
  near(compound(1000,.1,2,1,-100,1),1000);
  assert.equal(compound(100,0,1,12,-20,12),-140);
  near(compound(-1000,.1,2,1),-1210);
  near(compound(1000,-.1,2,1,100,1),1000);
  near(compound(1000,-.12,1,12,100,12), 1000*.99**12 + 100*(1-.99**12)/.01);
  assert.ok(Number.isFinite(compound(1000,-.9999,100,1,-100,1)));
});
test('partial periods and zero time do not count premature investments', () => {
  assert.equal(compound(1000,0,0,12,100,12),1000);
  assert.equal(compound(1000,0,1.5,12,100,1),1100);
  assert.equal(compound(1000,0,.1,12,100,12),1100);
  near(compound(0,.1,1.5,1,100,1),100*1.1**.5);
  near(compound(1000,1e-14,2,12,100,12),3400);
});
test('monthly savings rounds up and handles unreachable targets', () => { assert.equal(savingsMonths(1000,100,0,1250),3); assert.equal(savingsMonths(1000,100,0,1200),2); assert.equal(savingsMonths(1000,0,0,2000),Infinity); assert.equal(savingsMonths(0,0,.05,2000),Infinity); assert.equal(savingsMonths(2000,0,0,1000),0);const months=savingsMonths(10000,2000,.03,100000);const balance=n=>10000*(1+.03/12)**n+2000*((1+.03/12)**n-1)/(.03/12);assert.ok(balance(months)>=100000);assert.ok(balance(months-1)<100000); });
test('mortgage annuity schedule balances and equal capital reduces payment', () => { const loan=mortgage(1000000,.035,30);near(loan.payment,4490.446878);assert.equal(loan.rows.length,360);near(loan.rows.at(-1).remaining,0);near(loan.rows.reduce((s,r)=>s+r.capital,0),1000000);near(loan.total,loan.payment*360);const equal=mortgage(1000000,.035,30,'equal');assert.ok(equal.rows[0].payment>equal.rows.at(-1).payment);assert.ok(equal.total<loan.total);near(equal.rows.at(-1).remaining,0); });
test('zero rate mortgage and present value', () => {near(mortgage(120000,0,10).payment,1000);near(mortgage(120000,0,10).total,120000);near(presentValue(100000,.05,10),61391.325354);assert.equal(presentValue(100000,0,10),100000); });
