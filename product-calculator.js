// 商品计算器类 - 果冻租风格
class ProductCalculator {
    constructor() {
        // 初始化DOM元素（缓存所有需要的DOM元素）
        // 输入控件元素
        this.productPriceInput = document.getElementById('productPrice');
        this.downPaymentRatioSelect = document.getElementById('downPaymentRatio');
        this.leasePeriodSelect = document.getElementById('leasePeriod');
        this.calculateBtn = document.getElementById('calculateBtn');
        this.priceError = document.getElementById('priceError');
        
        // 预编译正则表达式，提高验证速度
        this.priceRegex = /^\d+(\.\d{1,2})?$/;
        
        // 结果显示元素
        this.downPayment = document.getElementById('downPayment');
        this.totalRent = document.getElementById('totalRent');
        this.installmentList = document.getElementById('installmentList');
        this.overviewSection = document.querySelector('.overview-section');
        this.billSection = document.querySelector('.bill-section');
        
        // 管理面板元素
        this.adminPanel = document.getElementById('adminPanel');
        this.closeAdminPanelBtn = document.getElementById('closeAdminPanel');
        this.ratioList = document.getElementById('ratioList');
        this.periodList = document.getElementById('periodList');
        this.addRatioBtn = document.getElementById('addRatioBtn');
        this.addPeriodBtn = document.getElementById('addPeriodBtn');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.rateTableContainer = document.getElementById('rateTable');
        
        // 初始化计算按钮为禁用状态
        this.calculateBtn.disabled = true;
        
        // 中文输入法支持相关变量
        this.priceValidationTimeout = null;
        this.isComposing = false;
        
        // 从localStorage加载费率配置
        this.loadSettings();
        
        // 初始化租期排序数组 - 确保租期选项能正常显示
        this.sortedPeriods = Object.keys(this.interestRates).map(Number).sort((a, b) => a - b);
        
        // 初始化事件监听器
        this.initEventListeners();
        
        // 初始化主界面下拉选项 - 关键修复：确保加载数据后更新主界面下拉菜单
        this.updateDownPaymentOptions();
        this.updateLeasePeriodOptions();
    }
    
    // 初始化事件监听器（优化：事件委托和减少重复验证）
    initEventListeners() {
        // 计算按钮点击事件
        this.calculateBtn.addEventListener('click', () => this.calculate());
        
        // 价格输入框实时验证（优化：添加中文输入法支持）
        
        // 监听中文输入法开始输入事件
        this.productPriceInput.addEventListener('compositionstart', () => {
            this.isComposing = true;
            clearTimeout(this.priceValidationTimeout);
        });
        
        // 监听中文输入法结束输入事件
        this.productPriceInput.addEventListener('compositionend', (e) => {
            this.isComposing = false;
            // 输入法完成后执行验证
            this.handlePriceInput(e);
        });
        
        // 普通输入事件处理
        this.productPriceInput.addEventListener('input', (e) => {
            if (!this.isComposing) {
                this.handlePriceInput(e);
            }
        });
        
        // 回车触发计算
        this.productPriceInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.calculateBtn.disabled) {
                this.calculate();
            }
        });
        
        // 首付比例变化事件
        this.downPaymentRatioSelect.addEventListener('change', () => {
            this.updateLeasePeriodOptions();
            this.checkInputComplete();
        });
        
        // 租期变化事件
        this.leasePeriodSelect.addEventListener('change', () => {
            this.checkInputComplete();
        });
        
        // 管理面板事件（使用事件委托处理删除按钮）
        this.closeAdminPanelBtn.addEventListener('click', () => this.hideAdminPanel());
        this.addRatioBtn.addEventListener('click', () => this.addRatioOption());
        this.addPeriodBtn.addEventListener('click', () => this.addPeriodOption());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        
        // 事件委托处理删除按钮
        this.ratioList.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const ratio = parseFloat(e.target.dataset.ratio);
                // 找到对应的列表项并删除
                const listItem = e.target.closest('.list-item');
                if (listItem && this.ratioList.children.length > 1) {
                    listItem.remove();
                } else {
                    alert('至少需要保留一个首付比例选项');
                }
            }
        });
        
        this.periodList.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const period = parseFloat(e.target.dataset.period);
                // 找到对应的列表项并删除
                const listItem = e.target.closest('.list-item');
                if (listItem && this.periodList.children.length > 1) {
                    listItem.remove();
                } else {
                    alert('至少需要保留一个期数选项');
                }
            }
        });
    }
    
    // 处理价格输入的统一方法
    handlePriceInput() {
        // 清除之前的定时器
        clearTimeout(this.priceValidationTimeout);
        
        // 添加延迟处理，减少延迟时间以提高响应速度
        this.priceValidationTimeout = setTimeout(() => {
            const isValid = this.validatePrice();
            this.checkAdminTrigger();
            
            // 直接检查输入是否完整，避免重复调用validatePrice
            const isRatioSelected = this.downPaymentRatioSelect.value !== '';
            const isPeriodSelected = this.leasePeriodSelect.value !== '';
            this.calculateBtn.disabled = !(isValid && isRatioSelected && isPeriodSelected);
            
            // 当商品售价修改或重新输入时，隐藏已计算的结果
            this.overviewSection.classList.add('hidden');
            this.billSection.classList.add('hidden');
            this.downPayment.textContent = '';
            this.totalRent.textContent = '';
            this.installmentList.innerHTML = '';
        }, 100);
    }
    
    // 验证价格输入（优化：使用预编译正则表达式，减少重复计算）
    validatePrice() {
        // 检查是否是触发文本
        if (this.productPriceInput.value === '今天开心888') {
            this.priceError.textContent = '';
            return false; // 不影响触发逻辑，但不进行正常计算
        }
        
        // 如果正在进行中文输入，不显示错误提示
        if (this.isComposing) {
            this.priceError.textContent = '';
            return false;
        }
        
        const price = this.productPriceInput.value.trim();
        
        if (!price) {
            this.priceError.textContent = '请输入商品售价';
            return false;
        }
        
        if (!this.priceRegex.test(price)) {
            this.priceError.textContent = '请输入有效的金额';
            return false;
        }
        
        const priceValue = parseFloat(price);
        if (priceValue < 1000) {
            this.priceError.textContent = '请输入有效的商品售价';
            return false;
        }
        
        this.priceError.textContent = '';
        return true;
    }
    
    // 检查输入是否完整，更新计算按钮状态
    checkInputComplete() {
        // 直接使用validatePrice的结果，避免重复验证
        const isPriceValid = this.validatePrice();
        const isRatioSelected = this.downPaymentRatioSelect.value !== '';
        const isPeriodSelected = this.leasePeriodSelect.value !== '';
        
        this.calculateBtn.disabled = !(isPriceValid && isRatioSelected && isPeriodSelected);
    }
    
    // 格式化金额显示（去掉千位分隔符）
    formatCurrency(amount) {
        return '¥' + amount.toFixed(2) + '元';
    }
    
    // 计算函数（优化：移除模拟延迟，优化数学运算）
    calculate() {
        // 验证输入
        if (!this.validatePrice()) {
            return;
        }
        
        // 获取并缓存输入值
        const productPrice = parseFloat(this.productPriceInput.value);
        const downPaymentRatio = parseFloat(this.downPaymentRatioSelect.value);
        const leasePeriod = parseInt(this.leasePeriodSelect.value);
        
        // 显示加载状态
        this.calculateBtn.textContent = '计算中...';
        this.calculateBtn.classList.add('loading');
        
        try {
            // 获取对应首付比例和租期的费率（优化：使用默认值处理）
            const rate = this.interestRates[leasePeriod]?.[downPaymentRatio] || 0.17;
            
            // 优化数学运算顺序，减少重复计算
            const totalAmountWithRate = productPrice * (1 + rate);
            const downPaymentAmount = productPrice * downPaymentRatio;
            const remainingAmount = totalAmountWithRate - downPaymentAmount;
            const periodCount = leasePeriod - 1;
            
            // 计算每期还款额（避免除以0）
            const monthlyPayment = periodCount > 0 ? remainingAmount / periodCount : 0;
            
            // 显示费用总览和账单详情
            this.overviewSection.classList.remove('hidden');
            this.billSection.classList.remove('hidden');
            
            // 显示计算结果（预格式化）
            this.downPayment.textContent = this.formatCurrency(downPaymentAmount);
            this.totalRent.textContent = this.formatCurrency(totalAmountWithRate);
            
            // 生成账单详情
            this.generateBillDetails(monthlyPayment, leasePeriod);
            
        } catch (error) {
            alert('计算出错，请重试');
            console.error('计算错误:', error);
        } finally {
            // 恢复按钮状态
            this.calculateBtn.textContent = '开始计算';
            this.calculateBtn.classList.remove('loading');
        }
    }
    
    // 生成账单详情（优化：使用模板字符串和更高效的循环）
    generateBillDetails(monthlyPayment, leasePeriod) {
        // 预格式化金额
        const formattedAmount = this.formatCurrency(monthlyPayment);
        
        // 使用模板字符串和更高效的循环方式
        let billsHTML = '';
        for (let i = 2; i <= leasePeriod; i++) {
            billsHTML += `<div class="bill-item">
                <span class="bill-label">第${i}期</span>
                <span class="bill-value currency">${formattedAmount}</span>
            </div>`;
        }
        
        // 一次性更新DOM
        this.installmentList.innerHTML = billsHTML;
    }
    
    // 检查是否触发隐藏功能（优化：减少不必要的操作）
    checkAdminTrigger() {
        // 确保触发文本完整匹配，避免不必要的操作
        if (this.productPriceInput.value === '今天开心888') {
            this.priceError.textContent = '';
            this.showAdminPanel();
        }
    }
    
    // 显示管理面板
    showAdminPanel() {
        this.adminPanel.style.display = 'block';
        this.populateAdminPanel();
    }
    
    // 隐藏管理面板
    hideAdminPanel() {
        this.adminPanel.style.display = 'none';
        // 清空触发文本
        this.productPriceInput.value = '';
        this.validatePrice();
    }
    

    
    // 填充管理面板数据（优化：减少DOM操作）
    populateAdminPanel() {
        // 填充首付比例
        this.ratioList.innerHTML = '';
        // 使用文档片段减少DOM操作
        const ratioFragment = document.createDocumentFragment();
        this.downPaymentOptions.forEach(ratio => {
            const ratioItem = this.createRatioItem(ratio);
            ratioFragment.appendChild(ratioItem);
        });
        this.ratioList.appendChild(ratioFragment);
        
        // 填充期数
        this.periodList.innerHTML = '';
        // 使用文档片段减少DOM操作
        const periodFragment = document.createDocumentFragment();
        // 缓存排序后的期数
        this.sortedPeriods = Object.keys(this.interestRates).map(Number).sort((a, b) => a - b);
        this.sortedPeriods.forEach(period => {
            const periodItem = this.createPeriodItem(period);
            periodFragment.appendChild(periodItem);
        });
        this.periodList.appendChild(periodFragment);
        
        // 填充费率配置表
        this.populateRateTable();
    }
    
    // 填充费率配置表（优化：使用缓存的排序期数）
    populateRateTable() {
        const rateTable = document.createElement('table');
        rateTable.className = 'rate-table';
        
        // 创建表头
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // 第一列表头（首付比例）
        const emptyTh = document.createElement('th');
        headerRow.appendChild(emptyTh);
        
        // 添加租期表头
        this.sortedPeriods.forEach(period => {
            const th = document.createElement('th');
            th.textContent = `${period}期`;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        rateTable.appendChild(thead);
        
        // 创建表格主体
        const tbody = document.createElement('tbody');
        
        // 遍历首付比例
        this.downPaymentOptions.forEach(ratio => {
            const row = document.createElement('tr');
            
            // 首付比例单元格
            const ratioTd = document.createElement('td');
            ratioTd.textContent = `${(ratio * 100).toFixed(0)}%`;
            row.appendChild(ratioTd);
            
            // 添加各租期的费率输入框
            this.sortedPeriods.forEach(period => {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '0';
                input.max = '100';
                input.step = '0.1';
                input.value = this.interestRates[period]?.[ratio] ? (this.interestRates[period][ratio] * 100).toFixed(1) : '0';
                input.dataset.period = period;
                input.dataset.ratio = ratio;
                td.appendChild(input);
                row.appendChild(td);
            });
            
            tbody.appendChild(row);
        });
        
        rateTable.appendChild(tbody);
        
        // 更新DOM
        this.rateTableContainer.innerHTML = '';
        this.rateTableContainer.appendChild(rateTable);
    }
    
    // 创建首付比例项（优化：使用document.createElement代替innerHTML，提高性能和安全性）
    createRatioItem(ratio) {
        const item = document.createElement('div');
        item.className = 'list-item';
        
        const input = document.createElement('input');
        input.type = 'number';
        input.value = (ratio * 100).toFixed(0);
        input.min = '1';
        input.max = '100';
        input.step = '5';
        
        const button = document.createElement('button');
        button.className = 'remove-btn';
        button.dataset.ratio = ratio;
        button.textContent = '删除';
        
        item.appendChild(input);
        item.appendChild(button);
        
        return item; // 返回创建的元素，而不是直接添加到DOM
    }
    
    // 创建期数项（优化：使用document.createElement代替innerHTML，提高性能和安全性）
    createPeriodItem(period) {
        const item = document.createElement('div');
        item.className = 'list-item';
        
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'period-input';
        input.value = period;
        input.min = '1';
        input.max = '36';
        input.step = '1';
        
        const button = document.createElement('button');
        button.className = 'remove-btn';
        button.dataset.period = period;
        button.textContent = '删除';
        
        item.appendChild(input);
        item.appendChild(button);
        
        return item; // 返回创建的元素，而不是直接添加到DOM
    }
    
    // 添加首付比例选项
    addRatioOption() {
        const ratioItem = this.createRatioItem(0.05); // 默认添加5%
        this.ratioList.appendChild(ratioItem);
    }
    

    
    // 添加期数选项（优化：使用缓存的排序期数）
    addPeriodOption() {
        // 找到最大的期数并加3
        const maxPeriod = Math.max(...this.sortedPeriods, 0);
        const newPeriod = maxPeriod + 3;
        const periodItem = this.createPeriodItem(newPeriod);
        this.periodList.appendChild(periodItem);
    }
    

    
    // 保存设置
    saveSettings() {
        // 保存首付比例
        const ratioInputs = this.ratioList.querySelectorAll('input');
        const newDownPaymentOptions = Array.from(ratioInputs)
            .map(input => parseFloat(input.value) / 100)
            .sort((a, b) => a - b);
        
        // 保存期数
        const periodItems = this.periodList.querySelectorAll('.list-item');
        const newPeriods = Array.from(periodItems)
            .map(item => parseInt(item.querySelector('.period-input').value))
            .sort((a, b) => a - b);
        
        // 初始化新的费率配置
        const newInterestRates = {};
        
        // 从费率配置表读取数据
        const rateInputs = this.rateTableContainer.querySelectorAll('input');
        rateInputs.forEach(input => {
            const period = parseInt(input.dataset.period);
            const ratio = parseFloat(input.dataset.ratio);
            const rate = parseFloat(input.value) / 100;
            
            if (!newInterestRates[period]) {
                newInterestRates[period] = {};
            }
            newInterestRates[period][ratio] = rate;
        });
        
        // 处理新增的首付比例和期数
        newDownPaymentOptions.forEach(ratio => {
            newPeriods.forEach(period => {
                if (!newInterestRates[period]) {
                    newInterestRates[period] = {};
                }
                if (newInterestRates[period][ratio] === undefined) {
                    // 如果没有设置，使用默认值
                    newInterestRates[period][ratio] = 0.17;
                }
            });
        });
        
        // 更新数据
        this.downPaymentOptions = newDownPaymentOptions;
        this.interestRates = newInterestRates;
        
        // 更新sortedPeriods以反映最新的租期选项
        this.sortedPeriods = Object.keys(this.interestRates).map(Number).sort((a, b) => a - b);
        
        // 将设置保存到localStorage
        this.saveSettingsToLocalStorage();
        
        // 更新下拉选项
        this.updateDownPaymentOptions();
        this.updateLeasePeriodOptions();
        
        // 隐藏管理面板
        this.hideAdminPanel();
        
        alert('设置已保存');
    }
    
    // 更新首付比例下拉选项（优化：使用文档片段减少DOM操作）
    updateDownPaymentOptions() {
        // 清空现有选项
        this.downPaymentRatioSelect.innerHTML = '';
        
        // 使用文档片段减少DOM操作
        const fragment = document.createDocumentFragment();
        
        // 添加新选项
        this.downPaymentOptions.forEach(ratio => {
            const option = document.createElement('option');
            option.value = ratio;
            option.textContent = `首付${(ratio * 100).toFixed(0)}％`;
            fragment.appendChild(option);
        });
        
        // 一次性添加到DOM
        this.downPaymentRatioSelect.appendChild(fragment);
        
        // 默认选择30%，如果不存在则选择第一个
        const thirtyPercentValue = 0.3;
        this.downPaymentRatioSelect.value = this.downPaymentOptions.includes(thirtyPercentValue) ? thirtyPercentValue : this.downPaymentOptions[0];
        
        // 更新租期选项
        this.updateLeasePeriodOptions();
    }
    
    // 更新租期下拉选项（优化：使用文档片段减少DOM操作）
    updateLeasePeriodOptions() {
        // 清空现有选项
        this.leasePeriodSelect.innerHTML = '';
        
        // 使用文档片段减少DOM操作
        const fragment = document.createDocumentFragment();
        
        // 添加"请选择"选项（不再默认选中）
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '请选择';
        defaultOption.className = 'placeholder-option';
        defaultOption.disabled = true;
        fragment.appendChild(defaultOption);
        
        // 获取当前选择的首付比例
        const selectedDownPayment = parseFloat(this.downPaymentRatioSelect.value);
        
        // 根据首付比例过滤租期选项
        // 只有首付比例大于或等于35%时，才显示12期及以上的租期
        this.sortedPeriods.forEach(period => {
            // 首付比例 >= 35% 时，显示所有租期选项
            // 首付比例 < 35% 时，显示6期和9期选项
            if (selectedDownPayment >= 0.35 || period <= 9) {
                const option = document.createElement('option');
                option.value = period;
                option.textContent = `${period}期`;
                // 默认选择6期
                if (period === 6) {
                    option.selected = true;
                }
                fragment.appendChild(option);
            }
        });
        
        // 一次性添加到DOM
        this.leasePeriodSelect.appendChild(fragment);
    }
    
    // 初始化默认设置
    initializeDefaultSettings() {
        // 保留50%首付选项
        this.downPaymentOptions = [0.25, 0.3, 0.35, 0.4, 0.5];
        this.interestRates = {
            6: { 0.25: 0.295, 0.3: 0.262, 0.35: 0.245, 0.4: 0.235, 0.5: 0.170 },
            9: { 0.25: 0.325, 0.3: 0.286, 0.35: 0.272, 0.4: 0.256, 0.5: 0.210 },
            12: { 0.25: 0.298, 0.3: 0.298, 0.35: 0.330, 0.4: 0.300, 0.5: 0.268 }
            // 移除24期选项
        };
    }
    
    // 从localStorage加载设置
    loadSettings() {
        const savedRates = localStorage.getItem('interestRates');
        const savedOptions = localStorage.getItem('downPaymentOptions');
        
        // 初始化默认设置
        this.initializeDefaultSettings();
        
        // 尝试从localStorage加载首付比例选项
        if (savedOptions) {
            try {
                this.downPaymentOptions = JSON.parse(savedOptions);
            } catch (error) {
                // 加载失败时保持默认设置
                console.warn('Failed to load down payment options from localStorage, using defaults.');
            }
        }
        
        // 尝试从localStorage加载费率配置
        if (savedRates) {
            try {
                this.interestRates = JSON.parse(savedRates);
            } catch (error) {
                // 加载失败时保持默认设置
                console.warn('Failed to load interest rates from localStorage, using defaults.');
            }
        }
        
        // 更新sortedPeriods以反映最新的租期选项
        this.sortedPeriods = Object.keys(this.interestRates).map(Number).sort((a, b) => a - b);
    }
    

    
    // 将设置保存到localStorage
    saveSettingsToLocalStorage() {
        try {
            localStorage.setItem('interestRates', JSON.stringify(this.interestRates));
            localStorage.setItem('downPaymentOptions', JSON.stringify(this.downPaymentOptions));
        } catch (error) {
            // 保存失败时不影响功能，继续使用当前内存中的设置
        }
    }
}

// 页面加载完成后初始化计算器
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new ProductCalculator();
});