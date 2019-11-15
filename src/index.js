const { router, text } = require('bottender/router');

////////////////////////// in bottender framework

// form router
function form(path, action){
  return {
    predicate: (context) => {
      // not in form
      if(context.state.form == null){
        return false;
      }
      // form completed
      if(context.state.form.completed) {
        return false;
      }
      // other form
      if(context.state.form.path != path){
        return false;
      }

      // form module just support text input for now.
      if(context.event.isText == false){
        return false;
      }

      // if not in correct pattern
      if(context.state.form.validateRegex.test(context.event.text)){
        context.state.form.params[context.state.form.waitingFor] = context.event.text
        context.state.form.waitingFor = null
      }
      return true;
    },
    action,
  };
}

// form waiting
function prompt(context, {path, param, validateRegex}){
  context.state.form.path = path
  context.state.form.waitingFor = param
  context.state.form.validateRegex = validateRegex || /[\s\S]*/
}








/////////////////// outside of bottender framework
async function menu(context){
  await context.sendText('Please type /form to start a form.');
}

async function getPersonalDataForm(context){
  await context.sendText('We want to collect your personal data:');
  context.state.form.params = {}
  return postPersonalDataForm
}

async function postPersonalDataForm(context){
  const confirm = context.state.form.params.confirm;

  // form reset
  if(confirm == 'no'){
    context.state.form.params = {}
  }

  // field reset
  if(confirm == 'phone' || confirm == 'name'){
    context.state.form.params[confirm] = null
    context.state.form.params.confirm = null
  }

  const name = context.state.form.params.name;
  const phone = context.state.form.params.phone;

  // use guard pattern to handle multiple turns conversation
  if(name == null){
    prompt(context, {
      path:'/form',
      param: 'name',
    })
    await context.sendText('Please type your name:');
    return
  }
  if(phone == null){
    prompt(context, {
      path:'/form',
      param: 'phone',
      validateRegex: /\d{10}/
    })
    await context.sendText('Please type your phone number (10 digits):');
    return
  }

  if(confirm == null){
    prompt(context, {
      path:'/form',
      param: 'confirm',
      validateRegex: /yes|no|name|phone/
    })
    await context.sendText(`${name}, your phone number is ${phone}, right?, if not, which part you want to refill? (yes|name|phone)`);
    return
  }

  if(confirm == 'yes'){
    context.state.form.completed = true
    await context.sendText(`Thank you for your help, your personal data was stored correctly.`);
  }
}

module.exports = async function App(context) {
  return router([
    text('menu', menu), //get menu anyway
    text("/form", getPersonalDataForm), // get request
    form("/form", postPersonalDataForm), // post request
    text("*", menu)
  ])
};
