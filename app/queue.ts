/*---------------------------------------------------------------------------------------------
 *  Copyright (c) LLC Operative. All rights reserved.
 *  Licensed under the proprietary license. See LICENSE.txt in the project root for license information.
 *  @author Evgeni Zharkov <zharkov.e.u@gmail.com>
 *--------------------------------------------------------------------------------------------*/

"use strict";

import {EventEmitter} from "events";

interface ILogger {
  error: (message: any) => void;
}

interface IQueueElement {
  timestamp: number;
  element: object;
}

export class DuplicateError extends Error {
  public task: object;

  constructor(message, task) {
    super(message);
    this.task = task;
    Object.setPrototypeOf(this, DuplicateError.prototype);
  }
}

class Queue {
  private checkQueue: IQueueElement[];
  private logger?: ILogger;

  constructor(logger?: ILogger) {
    this.checkQueue = [];
    this.logger = logger || null;
  }

  public push(unit: object): void {
    const queueElement: IQueueElement = {
      element: unit,
      timestamp: Date.now(),
    };
    if (!this.checkEquality(queueElement)) {
      this.checkQueue.push(queueElement);
    } else {
      if (this.logger && typeof this.logger.error === "function") {
        this.logger.error(`CheckEquality returned true: ${JSON.stringify(queueElement)}`);
      }
      throw new DuplicateError("InputQueue: CheckEquality returned true", queueElement);
    }
  }

  // TODO: Очистка очереди по временному параметру
  public pop(): IQueueElement {
    const queueLength: number = this.checkQueue.length;
    if (queueLength > 10) { this.checkQueue.shift(); }
    return queueLength ? this.checkQueue[queueLength - 1] : null;
  }

  public empty(): boolean {
    return this.checkQueue.length === 0;
  }

  // TODO: checkEquality по всей длине текущей очереди
  // TODO: проверка совпадений по хэшу
  private checkEquality(queueElement: IQueueElement): boolean {
    const queueLength: number = this.checkQueue.length;
    for (let i: number = queueLength - 10; i < queueLength; i++) {
      if (i < 0) { continue; }
      if (queueElement.timestamp - this.checkQueue[i].timestamp > 100000) { break; }
      if (JSON.stringify(queueElement.element) === JSON.stringify(this.checkQueue[i].element)) { return true; }
    }
    return false;
  }
}

export class TaskQueue {
  private queue: Queue;
  constructor() {
    this.queue = new Queue();
  }

  /**
   * Обработать задачу
   * Выбрасывает исключение DuplicateError
   * @param {Object} task
   * @returns {Object}
   */
  public taskHandle(task: object): object {
    this.queue.push(task);
    if (!this.queue.empty()) {
      return this.queue.pop().element;
    }
  }
}
