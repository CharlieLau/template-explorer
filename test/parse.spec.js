const assert = require('assert');


const  {parse} = require('../lib/template-exporer')

describe('Parse', function() {
  // it('should return -1 when the value is not present', function() {
  //   assert.equal([1,2,3].indexOf(4), -1);
  // });


  const  template=`
    <div>
      {% if (test > 1 ) { %}
          {{test}}
      <% } %>
    </div>
  `
  it('default',function(){
     const result =  parse(template)

     console.log(result)
  })

});