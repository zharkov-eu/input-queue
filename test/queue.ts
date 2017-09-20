/*---------------------------------------------------------------------------------------------
 *  Copyright (c) LLC Operative. All rights reserved.
 *  Licensed under the proprietary license. See LICENSE.txt in the project root for license information.
 *  @author Evgeni Zharkov <zharkov.e.u@gmail.com>
 *--------------------------------------------------------------------------------------------*/

"use strict";

import * as assert from "assert";
import "mocha";
import Queue from "../app/queue";

const queue = new Queue();

function taskHandler(queuedElements: object[]) {
  return (element: object, timestamp: number) => {
    queuedElements.push(element);
  };
}

describe("Проверка обработки элементов", () => {
  const queuedElements = [];
  const testCase = [{A: 1}, {B: 2}, {C: 3, D: [1, 2, 3, 4]}];
  const testCaseExpected = testCase;
  testCase.forEach((task) => {
    queue.taskHandle(task, taskHandler(queuedElements));
  });
  it("Обрабатывает все переданные элементы", () => {
    assert.deepEqual(queuedElements, testCaseExpected);
  });
});

describe("Проверка удаления дубликатов", () => {
  const queuedElements = [];
  const testCase = [{E: 1}, {E: 1}, {F: 1}, {E: 2}, {E: 1}, {G: 1}];
  const testCaseExpected = [{E: 1}, {F: 1}, {E: 2}, {G: 1}];
  testCase.forEach((task) => {
    queue.taskHandle(task, taskHandler(queuedElements));
  });
  it("Не пропускает дубликаты", () => {
    assert.deepEqual(queuedElements, testCaseExpected);
  });
});
