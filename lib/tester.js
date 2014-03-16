/**
 * simple tester library
 * 
 * example :
 *   tester.test(function() {
 *     // .. when satisfied it's OK
 *     return tester.ok } )
 */

var ok = { } // dummy object, just need something unique

var test = function(name, test) {
  console.log('--TEST', name)
  var result = test()
  if (result === ok) 
    console.log('--OK', name)
  else
    console.log('--FAIL', name, '..', result) }

module.exports = {
  ok : ok,
  test : test }
