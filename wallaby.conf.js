module.exports = function (w) {

  return {
    files: [
      'src/**/*.ts'
    ],

    tests: [
      'test/**/*.test.ts'
    ],

    compilers: {
      '**/*.ts': w.compilers.typeScript({'module': 'commonjs'})
    },

    env: {
      type: 'node',
      runner: 'node'
    },

    testFramework: 'jest'

  };
};
