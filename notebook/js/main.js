'use strict';

var AppNotepad = {
	itemId: 0,
	currentId: 'note-item-0',
	redactNote: false,
	noteData: [],
	noteForm: {},
	noteFilter: {},
	modalMore: {},
	initApp : function(){
		this.appNote = document.getElementById('AppNotepad');
		this.appNote.appendChild(this.createHtmlMarkup());

		if(localStorage.getItem('noteData')){
			this.noteData = JSON.parse(localStorage.getItem('noteData'));
			this.noteData.forEach(function(element, index) { 
				AppNotepad.noteData[index].id = index;
				AppNotepad.createItem(element.head, element.cont, element.date);
			});
		};

		this.appNote.addEventListener('click', function (event){

			var targetClass = event.target.classList;

			if (targetClass.contains('remove-note')) {
				var currentEll = event.target.parentNode.parentNode.parentNode;		
				AppNotepad.currentId = currentEll.id;
				AppNotepad.removeItem(currentEll);			
			}

			if (targetClass.contains('save-note')) {	
				AppNotepad.savedNote();			
			}

			if (targetClass.contains('change-note')) {
				var currentEll = event.target.parentNode.parentNode.parentNode;
				AppNotepad.redactNote = true;
				AppNotepad.currentId = currentEll.id;
				AppNotepad.noteData.forEach(function(element, index) { 
					if(element.id == AppNotepad.currentId.slice(-1)) {
						AppNotepad.modalShow(element.head, element.cont);
					}
				});				
			}

			if (targetClass.contains('note-new') || targetClass.contains('fa-plus')) {
				AppNotepad.redactNote = false;
				AppNotepad.modalShow();
			}

			if (targetClass.contains('chanel-note')) {
				AppNotepad.modalHide();
			}

			if (targetClass.contains('filter-name')) {
				AppNotepad.filterByName();
			}

			if (targetClass.contains('filter-date')) {
				AppNotepad.filterByDate(); 
			}

			if (targetClass.contains('filter-view')) {
				AppNotepad.changeView();
			}

			if (targetClass.contains('item-more')) {
				var currentEll = event.target.parentNode.parentNode;
				AppNotepad.redactNote = true;
				AppNotepad.currentId = currentEll.id;
				AppNotepad.noteData.forEach(function(element, index) { 
					if(element.id == AppNotepad.currentId.slice(-1)) {
						AppNotepad.moreShow(element.head, element.cont, element.date);
					}
				});
			}

			if (targetClass.contains('close-more')) {
				AppNotepad.moreHide();
			}
			
		}, false);

		this.noteForm.head.addEventListener('input', function (event){	
			AppNotepad.requiredNote(event); 
		}, false);

		this.noteForm.content.addEventListener('input', function (event){	
			AppNotepad.requiredNote(event); 
		}, false);
	},
	savedNote : function(){
		var ellHead = this.noteForm.head, 
			ellCont = this.noteForm.content,
			ellDate = new Date().toString();
		
		if(this.redactNote && this.requiredNoteTest()) {
			this.modalHide();
			this.changeItem(ellHead.value, ellCont.value, ellDate);
			this.noteData.forEach(function(element) { 
				if(element.id == AppNotepad.currentId.slice(-1)) {
					element.head = ellHead.value;
					element.cont = ellCont.value;
					element.date = ellDate;
				}
			});
			localStorage.setItem('noteData', JSON.stringify(this.noteData));
		} else if(this.requiredNoteTest()){
			this.modalHide();
			var dateEll = {
				id: this.itemId,
				head: ellHead.value,
				cont: ellCont.value,
				date: ellDate
			};
			this.createItem(ellHead.value, ellCont.value, ellDate);
			this.noteData.push(dateEll);
			localStorage.setItem('noteData', JSON.stringify(this.noteData));
		}				
	},
	removeItem : function(element){
		element.style.opacity = '0';

		var removeTimeOut = function() {
			this.noteContain.removeChild(element);
			this.noteData.forEach(function(element, index) { 
				if(element.id == AppNotepad.currentId.slice(-1)) {
					AppNotepad.noteData.splice(index, 1);
				}
			});
			localStorage.setItem('noteData', JSON.stringify(this.noteData));
		};
		setTimeout(function(){removeTimeOut.apply(AppNotepad)}, 400);
	},
	changeItem : function (textHead, textCont, ellDate){
		var currentItem = document.getElementById(this.currentId);
		textHead = textHead.length > 30 ? textHead.slice(0, 30) + ' ...' : textHead;
		textCont = textCont.length > 280 ? textCont.slice(0, 280) + ' ...' : textCont;
		currentItem.getElementsByClassName('item-header')[0].textContent = textHead;
		currentItem.getElementsByClassName('item-content')[0].textContent = textCont;
		currentItem.getElementsByClassName('item-date')[0].textContent = 'от: ' + new Date(ellDate).toLocaleString('ru');
	},
	createNode: function(typeEll, classEll, textEll){
		var nodeEll = document.createElement(typeEll);
		if(classEll) nodeEll.className = classEll;
		if(textEll) nodeEll.textContent = textEll;
		return nodeEll;	
	},
	createHtmlMarkup: function(){
		var appDom = document.createDocumentFragment(),
			appNote = this.createNode('div', 'notepad-wrap'),
			noteHeader = this.createNode('div', 'note-header'),
			headerLeft = this.createNode('div', 'note-left'),
			filterName = this.createNode('span', 'filter-name note-filter', 'по имени '),
			filterDate = this.createNode('span', 'filter-date note-filter', 'по дате '),
			iconChevron = this.createNode('i', 'fa fa-chevron-down'),
			headerRight = this.createNode('div', 'note-right'),
			filterView = this.createNode('span', 'filter-view note-filter row-view', 'плитка'),
			noteContain = this.createNode('div', 'note-contain'),
			ellNew = this.createNode('div', 'note-new note-ell'),
			newAdd = this.createNode('div', 'new-add'),
			iconPlus =  this.createNode('i', 'fa fa-plus'),
			noteModalWind = this.createNode('div', 'modal-wind'),
			modalBlock = this.createNode('div', 'modal-form modal-blok'),
			blockHead = this.createNode('div', 'modal-head', 'Настройка записи'),
			blockContent = this.createNode('div', 'modal-content'),
			blockBtnWrap = this.createNode('div', 'text-center'),
			btnSave = this.createNode('div', 'wind-btn'),
			btnChanel = this.createNode('div', 'wind-btn'),
			btnBg = this.createNode('span', 'bt-bg'),
			formInput = document.createElement('input'),
			textArea = document.createElement('textarea'),
			modalMore = this.createNode('div', 'modal-more modal-blok'),
			moreHead = this.createNode('div', 'modal-head'),
			moreContent = this.createNode('div', 'modal-content'),
			moreDate = this.createNode('div', 'modal-date'),
			moreClose = this.createNode('i', 'close-more fa fa-times');



		headerLeft.appendChild(this.createNode('span', 'filter-head', 'Фильтр записей:'));
		headerLeft.appendChild(filterName).appendChild(iconChevron);
		headerLeft.appendChild(filterDate).appendChild(iconChevron.cloneNode());;

		headerRight.appendChild(this.createNode('span', 'filter-head', 'Вид:'));
		headerRight.appendChild(filterView);

		noteHeader.appendChild(headerLeft);
		noteHeader.appendChild(headerRight);

		noteContain.appendChild(ellNew).appendChild(newAdd).appendChild(iconPlus);

		appNote.appendChild(noteHeader);
		appNote.appendChild(noteContain);


		blockContent.appendChild(this.createNode('p','', 'Введите текст заголовка:'));
		formInput.setAttribute('type', 'text');
		formInput.setAttribute('name', 'note-head');
		blockContent.appendChild(formInput);
		blockContent.appendChild(this.createNode('p', '', 'Введите текст записи:'));
		blockContent.appendChild(textArea);

		btnSave.appendChild(btnBg);
		btnSave.appendChild(this.createNode('span', 'save-note bt-text', 'Сохранить'));
		btnChanel.appendChild(btnBg.cloneNode());
		btnChanel.appendChild(this.createNode('span', 'chanel-note bt-text', 'Отмена'));
		blockBtnWrap.appendChild(btnSave);
		blockBtnWrap.appendChild(btnChanel);
		blockContent.appendChild(blockBtnWrap);

		modalBlock.appendChild(blockHead);
		modalBlock.appendChild(blockContent);
		
		modalMore.appendChild(moreClose);
		modalMore.appendChild(moreHead);
		modalMore.appendChild(moreDate);
		modalMore.appendChild(moreContent);
		
		noteModalWind.appendChild(modalBlock);
		noteModalWind.appendChild(modalMore);

		appDom.appendChild(appNote);
		appDom.appendChild(noteModalWind);

		this.noteContain = noteContain;
		this.noteModal = noteModalWind;

		this.noteForm.head = formInput;
		this.noteForm.content = textArea;

		this.modalMore.head = moreHead;
		this.modalMore.date = moreDate;
		this.modalMore.content = moreContent;

		this.noteFilter.name = filterName;
		this.noteFilter.date = filterDate;
		this.noteFilter.view = filterView;

		return appDom;
	},
	createItem : function(textHead, textCont, ellDate){
		textHead = textHead.length > 30 ? textHead.slice(0, 30) + ' ...' : textHead;
		textCont = textCont.length > 280 ? textCont.slice(0, 280) + ' ...' : textCont;

		var noteItem = this.createNode('div', 'note-item note-ell'),
			itemHead = this.createNode('div', 'item-head'),
			itemIcon = this.createNode('div', 'item-icon'),
			iconChange = this.createNode('i', 'change-note fa fa-pencil'),
			iconRemove =  this.createNode('i', 'remove-note fa fa-times'),
			itemName = this.createNode('h3', 'item-header', textHead),
			itemContent = this.createNode('div', 'item-content', textCont),
			itemFoot = this.createNode('span', 'item-foot'),
			itemMore = this.createNode('span', 'item-more', 'Подробнее...'),
			itemDate = this.createNode('span', 'item-date', 'от: ' + new Date(ellDate).toLocaleString('ru')),
			itemList = this.noteContain.getElementsByClassName('note-item');
			
		noteItem.id = 'note-item-' + this.itemId;
		this.itemId += 1;

		itemIcon.appendChild(iconChange);
		itemIcon.appendChild(iconRemove);
		itemHead.appendChild(itemIcon);
		itemHead.appendChild(itemName);
		noteItem.appendChild(itemHead);
		noteItem.appendChild(itemContent);
		itemFoot.appendChild(itemDate);
		itemFoot.appendChild(itemMore);
		noteItem.appendChild(itemFoot);

		(itemList) ? this.noteContain.insertBefore(noteItem, itemList[0]) : this.noteContain.appendChild(noteItem);
	},
	filterByName : function(){
		var itemList = Array.prototype.slice.call(this.noteContain.children, 1); 
		this.noteFilter.name.classList.toggle('reverse');

		itemList.sort(function(item1,item2) {
			var val1 = item1.getElementsByClassName('item-header')[0].textContent,
				val2 = item2.getElementsByClassName('item-header')[0].textContent;	
			if(AppNotepad.noteFilter.name.classList.contains('reverse')){
				if (val1 < val2) return 1;
				else if (val1 > val2) return -1;
				else return 0;
			} else {	
				if (val1 < val2) return -1;
				else if (val1 > val2) return 1;
				else return 0;
			}			
		});
		for(var i = 0; i < itemList.length; i++) this.noteContain.appendChild(itemList[i]);
	},
	filterByDate : function(){
		var itemList = Array.prototype.slice.call(this.noteContain.children, 1);
		this.noteFilter.date.classList.toggle('reverse'); 			

		itemList.sort(function(item1,item2) {
			var val1 = item1.getElementsByClassName('item-date')[0].textContent,
				val2 = item2.getElementsByClassName('item-date')[0].textContent;
			if(AppNotepad.noteFilter.date.classList.contains('reverse')){
				if (val1 < val2) return 1;
				else if (val1 > val2) return -1;
				else return 0;
			} else {		
				if (val1 < val2) return -1;
				else if (val1 > val2) return 1;
				else return 0;
			}			
		});
		for(var i = 0; i < itemList.length; i++) this.noteContain.appendChild(itemList[i]);
	},
	changeView: function(){
		if(this.noteFilter.view.classList.contains('row-view')){
			this.noteFilter.view.textContent = 'список';
			this.noteFilter.view.classList.toggle('row-view');
			this.noteContain.classList.toggle('flex-coll');
		} else {
			this.noteFilter.view.textContent = 'плитка';
			this.noteFilter.view.classList.toggle('row-view');
			this.noteContain.classList.toggle('flex-coll');
		}
	},
	requiredNote: function(event){
		(event.target.value.replace(/\s/g, '')) ? event.target.classList.remove('error') : event.target.classList.add('error');	
	},
	requiredNoteTest: function(){
		(this.noteForm.head.value.replace(/\s/g, '')) ? this.noteForm.head.classList.remove('error') : this.noteForm.head.classList.add('error');
		(this.noteForm.content.value.replace(/\s/g, '')) ? this.noteForm.content.classList.remove('error') : this.noteForm.content.classList.add('error');
		if(this.noteForm.head.value.replace(/\s/g, '') && this.noteForm.content.value.replace(/\s/g, '')) {
			return true
		} else {
			return false
		} 
	},
	modalShow: function(textHead, textCont){
		if(textHead) {this.noteForm.head.value = textHead};
		if(textCont) {this.noteForm.content.value = textCont};
		this.noteModal.style.visibility = 'visible';
		this.noteModal.style.opacity = '1';
		this.noteModal.firstElementChild.style.zIndex = '10';
		this.noteModal.firstElementChild.style.opacity = '1';
		this.noteModal.firstElementChild.style.transform = 'translate(-50%, -50%)';

	},
	modalHide: function(){
		this.noteModal.style.opacity = '0';
		this.noteModal.firstElementChild.style.zIndex = '0';
		this.noteModal.firstElementChild.style.opacity = '0';
		this.noteModal.firstElementChild.style.transform = 'translate(-50%, -80%)';
		var hideTimeOut = function() {
			this.noteModal.style.visibility = 'hidden';
			this.noteForm.head.value = '';
			this.noteForm.content.value = '';
			this.noteForm.head.classList.remove('error');
			this.noteForm.content.classList.remove('error');
		};
		setTimeout(function(){hideTimeOut.apply(AppNotepad)}, 300);
	},
	moreShow: function(textHead, textCont, textDate){
		this.modalMore.head.textContent  = textHead;
		this.modalMore.content.textContent  = textCont;
		this.modalMore.date.textContent = 'от: ' + new Date(textDate).toLocaleString('ru');
		this.noteModal.style.visibility = 'visible';
		this.noteModal.style.opacity = '1';
		this.noteModal.lastElementChild.style.zIndex = '10';
		this.noteModal.lastElementChild.style.opacity = '1';
		this.noteModal.lastElementChild.style.transform = 'translate(-50%, -50%)';
	},
	moreHide: function(){
		this.noteModal.style.opacity = '0';
		this.noteModal.lastElementChild.style.zIndex = '0';
		this.noteModal.lastElementChild.style.opacity = '0';
		this.noteModal.lastElementChild.style.transform = 'translate(-50%, -80%)';
		var hideTimeOut = function() {
			this.noteModal.style.visibility = 'hidden';
		};
		setTimeout(function(){hideTimeOut.apply(AppNotepad)}, 300);
	},
};


window.addEventListener('load', function (){
	AppNotepad.initApp();	
}, false);