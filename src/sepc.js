async function formAction(context, props){
  // use guard pattern to handle multiple turns conversation
  if(props.name == null){
    await context.sendText('Please type your name:');
    return requireField('name')
  }

  if(props.phone == null){
    await context.sendText('Please type your phone number (10 digits):');
    return requireField('phone', /\d{10}/)
  }

  if(props.confrim == null){
    await context.sendText(`${name}, your phone number is ${phone}, right?, if not, which part you want to refill? (yes|no|name|phone)`);
    return requireField('phone', /yes|no|name|phone/)
  }

  if(props.confirm == 'yes'){
    await context.sendText(`Thank you for your help, your personal data was stored correctly.`);
  }
}
