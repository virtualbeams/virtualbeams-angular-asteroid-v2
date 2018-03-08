export function vbaRestartSubscriptions() {

  /*
  *   Private methods: they are invoked with the asteroid instance as context, but
  *   they are not exported so they don't clutter the Asteroid class prototype.
  */

  function restartSubscription(sub: any) {
    // Only restart the subscription if it isn't still in ddp's queue.
    if (!sub.stillInQueue) {
      // Handlers to ddp's connected event are invoked asynchronously (see
      // https://github.com/mondora/ddp.js/blob/master/src/ddp.js#L20).
      // Therefore there is a (very very small) chance that between the time
      // when the connected message is received and the time when the
      // connected handler is invoked, the ddp instance disconnected.
      // Therefore we update the stillInQueue status fo the subscription
      this.ddp.sub(sub.name, sub.params, sub.id);
      sub.stillInQueue = (this.ddp.status !== 'connected');
    } else {
      // Since we're restarting subscriptions after a connection, we know
      // that now the subscriptions which were in ddp's queue will be sent,
      // therefore we need to remove the stillInQueue flag from them
      sub.stillInQueue = false;
    }
  }

  this.ddp.on('connected', () => {
    this.subscriptions.cache.forEach(restartSubscription.bind(this));
  });

}
