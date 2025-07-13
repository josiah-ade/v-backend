 // async check(): Promise<HealthCheckResult> {
  //   const list = [
  //     () => this.db.pingCheck('database'),
  //     ...(this.configService.get('app.nodeEnv', { infer: true }) ===
  //     Environment.DEVELOPMENT
  //       ? [
  //           () =>
  //             this.http.pingCheck(
  //               'app',
  //               `${this.configService.get('app.url', { infer: true })}/health`,
  //             ),
  //         ]
  //       : []),
  //   ];
  //   return this.health.check(list);
  // }