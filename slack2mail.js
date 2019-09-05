const sgMail = require('@sendgrid/mail');

function sendMail(text) {
    sgMail.setApiKey(process.env.SENDGRID_KEY);

    // HTMLエスケープ戻す
    var trimText = text.replace(/```/g, '').replace('hogehoge', '').replace(/&lt;/g, '<') .replace(/&gt;/g, '>') .replace(/&quot;/g, '"') .replace(/&#039;/g, '\'') .replace(/&#044;/g, ',') .replace(/&amp;/g, '&');

    var textArray = trimText.split('\n');
    console.log(textArray);

    // 1行目がメンション、2行目がタイトルの想定
    var title = textArray[1];
    if (!title) {
        title = textArray[2];
    }
    // 1行目と2行目を削る
    textArray.shift();
    textArray.shift();
    var result = textArray.join('\r\n');

    const msg = {
        to: 'nippou@ml.gmo-am.jp',
        from: 'noreply@gmo-am.jp',
        subject: title,
        text: result,
    };
    sgMail
      .send(msg)
      .then(() => {
          console.log('送信完了');
      })
      .catch(error => {
          console.error(error.toString());
      });
};


// Main
const onRequest = (req, res) => {
    let payload = req.body;
    console.log(payload);
  
    // slackが不定期に送る認証用
    // https://api.slack.com/events/url_verification
    if (payload.type === 'url_verification') {
        return res.status(200).json({ 'challenge': payload.challenge });
    }
  
    // メンションされた時
    if (payload.event && payload.event.type ===  'app_mention') {
      var text = payload.event.text;
      console.log(text);
      if (text.indexOf('```')){
      	sendMail(text);
      }
    }
  
    res.status(200).send('OK');
}

exports.slackBot = onRequest;
