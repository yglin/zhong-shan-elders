'use strict';

describe('Elders E2E Tests:', function () {
  describe('Test elders page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/elders');
      expect(element.all(by.repeater('elder in elders')).count()).toEqual(0);
    });
  });
});
