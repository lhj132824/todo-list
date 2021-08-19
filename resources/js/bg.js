/**
 * 
 */
/* 이미지 불러오기  */
let getBackgroundImage = async () => {
	/*이전 백그라운드는 요거다!!*/
	let prevBackground = JSON.parse(localStorage.getItem('bg-log'));
	
	/*만약 이전백그라운드가 존재하고 이전백그라운드의 만료시간이 현재시간보다 크다면 이전의 이미지 인포를 반환한다.
	  => 새롭게 이미지를 받아오지 않는다. 
	*/
	if(prevBackground && (prevBackground.expiresOn > Date.now())){
		return prevBackground.imgInfo;
	}
	
	let imgObject = await requestBackground();
	insertBackgroundLog(imgObject);
	return imgObject;
};


let requestBackground = async () => {
	let params = {
		orientation: 'landscape',
		query: 'landscape'
	}
	
	let queryString = createQueryString(params);
	let response = await fetch('https://api.unsplash.com/photos/random?'+ queryString,{
							method:'get',
							headers:{Authorization: 'Client-ID Qk6WiR6vhtNKK-1CXxfN-FWyea9rh1WmzAc7dm3V_L4'}
						});
	let obj = await response.json();
	
	return {
		img: obj.urls.full,
		place: obj.location.title
	}
}


/*storage에 저장하기*/
let insertBackgroundLog = (imgObject) => {
	/* ***사진을 하루에 한번만 바뀌게 설정해주기*** */
	
	/*1. 저장할 객체를 만들고*/
	//let imgObject = {
	//	img: obj.urls.full,
	//	place: obj.location.title
	//}
	
	/*2. 만료날짜를 오늘날짜 +1 로 잡아주기*/
	let expirationDate = new Date();
	expirationDate = expirationDate.setDate(expirationDate.getDate() + 1);
	
	/*3. 백그라운드 로그 객체에 다 넣어주기*/
	const backgroundLog = {
		expiresOn: expirationDate,
		imgInfo: imgObject
	} 
	
	
	/*json으로 파싱해서 Stirng화 시킨다음 스트링 스트림인 storage에 저장한다.*/
	localStorage.setItem('bg-log',JSON.stringify(backgroundLog));
}

/* 현재위치 세팅하기  */
let setCurrentPositionInfo = async () => {
	let coords = await getCoords();	
}


/* 현재 위치 받아오는 함수*/
let getCoords = () => {
	if(!navigator.geolocation) {
		return new Promise((resolve,reject)=>{
			  reject();
			  });
		 reject();
	}else{
		  return new Promise((resolve,reject)=>{
			  navigator.geolocation.getCurrentPosition((position) => {
				  resolve(position.coords);
			  });
		  })
    }
}

/* 날씨 불러오기*/
let getLocationTemp = async () => {
	
	const OPEN_WEATHER_API_KEY = '99c5c2eb76b6c3ed4023bcf302565e40'; 
	let coords = await getCoords();
	
	let params = {
			lat: coords.latitude,
			lon: coords.longitude,
			appid: OPEN_WEATHER_API_KEY,
			units: 'metric',
			lang: 'kr'
	};
	
	let queryString = createQueryString(params);
	let url = `https://api.openweathermap.org/data/2.5/weather?${queryString}`;
	
	let response = await fetch(url,{method:'get'});
	let obj = await response.json();
	return {
		temp: obj.main.temp,
		place: obj.name
	}
}	


(async () => {
	/*배경 이미지와 이미지의 위치정보 랜더링*/
	let background = await getBackgroundImage();
	document.querySelector('body').style.backgroundImage = `url(${background.img})`;
	
	if(background.place){
		document.querySelector('.footer_text').innerHTML = background.place;
	}
	/*지역과 기온 렌더링*/
	let locationTemp = await getLocationTemp();
	document.querySelector('.location_text').innerHTML = locationTemp.temp + 'º @ ' + locationTemp.place;
	
})();


