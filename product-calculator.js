// 商品计算器类 - 果冻租风格
class ProductCalculator {
    constructor() {
        // 初始化DOM元素
        this.productPriceInput = document.getElementById('productPrice');
        this.downPaymentRatioSelect = document.getElementById('downPaymentRatio');
        this.leasePeriodSelect = document.getElementById('leasePeriod');
        this.calculateBtn = document.getElementById('calculateBtn');
        this.priceError = document.getElementById('priceError');
        
        // 结果显示元素
        this.downPayment = document.getElementById('downPayment');
        this.totalRent = document.getElementById('totalRent');
        this.interestRate = document.getElementById('interestRate');
        this.installmentList = document.getElementById('installmentList');
        this.overviewSection = document.querySelector('.overview-section');
        this.billSection = document.querySelector('.bill-section');
        
        // 初始化计算按钮为禁用状态
        this.calculateBtn.disabled = true;
        
        // 隐藏管理面板元素
        this.adminPanel = document.getElementById('adminPanel');
        this.closeAdminPanelBtn = document.getElementById('closeAdminPanel');
        this.ratioList = document.getElementById('ratioList');
        this.periodList = document.getElementById('periodList');
        this.addRatioBtn = document.getElementById('addRatioBtn');
        this.addPeriodBtn = document.getElementById('addPeriodBtn');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        
        // 从localStorage加载费率配置
        this.loadSettings();
        
        // 初始化事件监听器
        this.initEventListeners();
        
        // 初始化管理面板
        this.initAdminPanel();
        
        // 初始化主界面下拉选项 - 关键修复：确保加载数据后更新主界面下拉菜单
        this.updateDownPaymentOptions();
        this.updateLeasePeriodOptions();
    }
    
    // 初始化事件监听器
    initEventListeners() {
        // 计算按钮点击事件
        this.calculateBtn.addEventListener('click', () => this.calculate());
        
        // 价格输入框实时验证
        this.productPriceInput.addEventListener('input', () => {
            this.validatePrice();
            this.checkAdminTrigger();
            this.checkInputComplete();
        });
        
        // 回车触发计算
        this.productPriceInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
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
        
        // 管理面板事件
        this.closeAdminPanelBtn.addEventListener('click', () => this.hideAdminPanel());
        this.addRatioBtn.addEventListener('click', () => this.addRatioOption());
        this.addPeriodBtn.addEventListener('click', () => this.addPeriodOption());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    }
    
    // 验证价格输入
    validatePrice() {
        // 检查是否是触发文本
        if (this.productPriceInput.value === '今天开心888') {
            this.priceError.textContent = '';
            return false; // 不影响触发逻辑，但不进行正常计算
        }
        
        const price = parseFloat(this.productPriceInput.value);
        
        if (isNaN(price) || price <= 0) {
            this.priceError.textContent = '请输入有效的商品售价';
            return false;
        } else {
            this.priceError.textContent = '';
            return true;
        }
    }
    
    // 检查输入是否完整，更新计算按钮状态
    checkInputComplete() {
        const isPriceValid = this.validatePrice();
        const isRatioSelected = this.downPaymentRatioSelect.value !== '';
        const isPeriodSelected = this.leasePeriodSelect.value !== '';
        
        this.calculateBtn.disabled = !(isPriceValid && isRatioSelected && isPeriodSelected);
    }
    
    // 格式化金额显示
    formatCurrency(amount) {
        return '¥' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '元';
    }
    
    // 计算函数
    calculate() {
        // 验证输入
        if (!this.validatePrice()) {
            return;
        }
        
        // 获取输入值
        const productPrice = parseFloat(this.productPriceInput.value);
        const downPaymentRatio = parseFloat(this.downPaymentRatioSelect.value);
        const leasePeriod = parseInt(this.leasePeriodSelect.value);
        
        // 显示加载状态
        this.calculateBtn.textContent = '计算中...';
        this.calculateBtn.classList.add('loading');
        
        // 模拟网络延迟
        setTimeout(() => {
            try {
                // 获取对应首付比例和租期的费率
                const rate = this.interestRates[leasePeriod]?.[downPaymentRatio] || 0.17;
                
                // 计算首付金额
                const downPaymentAmount = productPrice * downPaymentRatio;
                
                // 计算总租金（包含费率）
                const totalRentAmount = productPrice * (1 + rate);
                
                // 计算每期还款额
                const monthlyPayment = (totalRentAmount - downPaymentAmount) / (leasePeriod - 1);
                
                // 显示费用总览和账单详情
                this.overviewSection.classList.remove('hidden');
                this.billSection.classList.remove('hidden');
                
                // 显示计算结果
                this.downPayment.textContent = this.formatCurrency(downPaymentAmount);
                this.totalRent.textContent = this.formatCurrency(totalRentAmount);
                
                // 生成账单详情
                this.generateBillDetails(downPaymentAmount, monthlyPayment, leasePeriod);
                
            } catch (error) {
                alert('计算出错，请重试');
                console.error('计算错误:', error);
            } finally {
                // 恢复按钮状态
                this.calculateBtn.textContent = '开始计算';
                this.calculateBtn.classList.remove('loading');
            }
        }, 500);
    }
    
    // 生成账单详情
    generateBillDetails(downPayment, monthlyPayment, leasePeriod) {
        // 清空现有账单
        this.installmentList.innerHTML = '';
        
        // 生成各期账单
        for (let i = 2; i <= leasePeriod; i++) {
            const billItem = document.createElement('div');
            billItem.className = 'bill-item';
            
            const billLabel = document.createElement('span');
            billLabel.className = 'bill-label';
            billLabel.textContent = `第${i}期`;
            
            const billValue = document.createElement('span');
            billValue.className = 'bill-value currency';
            billValue.textContent = this.formatCurrency(monthlyPayment);
            
            billItem.appendChild(billLabel);
            billItem.appendChild(billValue);
            
            this.installmentList.appendChild(billItem);
        }
    }
    
    // 检查是否触发隐藏功能
    checkAdminTrigger() {
        // 确保触发文本完整匹配
        if (this.productPriceInput.value === '今天开心888') {
            // 清除验证错误信息
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
    
    // 初始化管理面板
    initAdminPanel() {
        // 初始填充数据
        this.populateAdminPanel();
    }
    
    // 填充管理面板数据
    populateAdminPanel() {
        // 填充首付比例
        this.ratioList.innerHTML = '';
        this.downPaymentOptions.forEach(ratio => {
            this.createRatioItem(ratio);
        });
        
        // 填充期数
        this.periodList.innerHTML = '';
        Object.keys(this.interestRates).sort((a, b) => a - b).forEach(period => {
            this.createPeriodItem(parseInt(period));
        });
        
        // 填充费率配置表
        this.populateRateTable();
    }
    
    // 填充费率配置表
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
        const sortedPeriods = Object.keys(this.interestRates).map(Number).sort((a, b) => a - b);
        sortedPeriods.forEach(period => {
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
            sortedPeriods.forEach(period => {
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
        const rateTableContainer = document.getElementById('rateTable');
        rateTableContainer.innerHTML = '';
        rateTableContainer.appendChild(rateTable);
    }
    
    // 创建首付比例项
    createRatioItem(ratio) {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <input type="number" value="${(ratio * 100).toFixed(0)}" min="1" max="100" step="5">
            <button class="remove-btn" onclick="calculator.removeRatioItem(this)">删除</button>
        `;
        this.ratioList.appendChild(item);
    }
    
    // 创建期数项
    createPeriodItem(period) {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <input type="number" class="period-input" value="${period}" min="1" max="36" step="1">
            <button class="remove-btn" onclick="calculator.removePeriodItem(this)">删除</button>
        `;
        this.periodList.appendChild(item);
    }
    
    // 添加首付比例选项
    addRatioOption() {
        this.createRatioItem(0.05); // 默认添加5%
    }
    
    // 删除首付比例选项
    removeRatioItem(btn) {
        const item = btn.closest('.list-item');
        if (this.ratioList.children.length > 1) {
            item.remove();
        } else {
            alert('至少需要保留一个首付比例选项');
        }
    }
    
    // 添加期数选项
    addPeriodOption() {
        // 找到最大的期数并加3
        const maxPeriod = Math.max(...Object.keys(this.interestRates).map(Number), 0);
        const newPeriod = maxPeriod + 3;
        this.createPeriodItem(newPeriod);
    }
    
    // 删除期数选项
    removePeriodItem(btn) {
        const item = btn.closest('.list-item');
        if (this.periodList.children.length > 1) {
            item.remove();
        } else {
            alert('至少需要保留一个期数选项');
        }
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
        const rateInputs = document.querySelectorAll('#rateTable input');
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
        
        // 将设置保存到localStorage
        this.saveSettingsToLocalStorage();
        
        // 更新下拉选项
        this.updateDownPaymentOptions();
        this.updateLeasePeriodOptions();
        
        // 隐藏管理面板
        this.hideAdminPanel();
        
        alert('设置已保存');
    }
    
    // 更新首付比例下拉选项
    updateDownPaymentOptions() {
        // 清空现有选项
        this.downPaymentRatioSelect.innerHTML = '';
        
        // 添加新选项
        this.downPaymentOptions.forEach(ratio => {
            const option = document.createElement('option');
            option.value = ratio;
            option.textContent = `首付${(ratio * 100).toFixed(0)}％`;
            this.downPaymentRatioSelect.appendChild(option);
        });
        
        // 默认选择30%，如果不存在则选择第一个
        const thirtyPercentValue = 0.3;
        if (this.downPaymentOptions.includes(thirtyPercentValue)) {
            this.downPaymentRatioSelect.value = thirtyPercentValue;
        } else {
            this.downPaymentRatioSelect.value = this.downPaymentOptions[0];
        }
        
        // 更新租期选项
        this.updateLeasePeriodOptions();
    }
    
    // 更新租期下拉选项（根据首付比例和费率配置）
    updateLeasePeriodOptions() {
        // 清空现有选项
        this.leasePeriodSelect.innerHTML = '';
        
        // 添加"请选择"选项（不再默认选中）
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '请选择';
        defaultOption.className = 'placeholder-option';
        defaultOption.disabled = true;
        this.leasePeriodSelect.appendChild(defaultOption);
        
        // 获取当前选择的首付比例
        const selectedDownPayment = parseFloat(this.downPaymentRatioSelect.value);
        
        // 添加可用的租期选项（首付35%以上才显示12期）
        Object.keys(this.interestRates)
            .map(Number)
            .sort((a, b) => a - b)
            .forEach(period => {
                // 只有当首付比例大于等于35%或期数不是12期时才显示
                if (selectedDownPayment >= 0.35 || period !== 12) {
                    const option = document.createElement('option');
                    option.value = period;
                    option.textContent = `${period}期`;
                    // 默认选择6期
                    if (period === 6) {
                        option.selected = true;
                    }
                    this.leasePeriodSelect.appendChild(option);
                }
            });
    }
    
    // 从localStorage加载设置
    loadSettings() {
        const savedRates = localStorage.getItem('interestRates');
        const savedOptions = localStorage.getItem('downPaymentOptions');
        
        // 初始化默认的首付比例选项
        if (savedOptions) {
            try {
                this.downPaymentOptions = JSON.parse(savedOptions);
        } catch (error) {
            // 默认首付比例选项
            this.downPaymentOptions = [0.25, 0.3, 0.35, 0.4];
        }
        } else {
            // 默认首付比例选项
            this.downPaymentOptions = [0.25, 0.3, 0.35, 0.4];
        }
        
        // 初始化默认的租期选项
        if (savedRates) {
            try {
                this.interestRates = JSON.parse(savedRates);
            } catch (error) {
                // 默认费率配置（首付比例 × 租期）
                this.interestRates = {
                    6: { 0.25: 0.255, 0.3: 0.235, 0.35: 0.23, 0.4: 0.22 },
                    9: { 0.25: 0.275, 0.3: 0.268, 0.35: 0.268, 0.4: 0.265 },
                    12: { 0.25: 0.298, 0.3: 0.298, 0.35: 0.295, 0.4: 0.285 }
                };
            }
        } else {
            // 默认费率配置（首付比例 × 租期）
            this.interestRates = {
                6: { 0.25: 0.255, 0.3: 0.235, 0.35: 0.23, 0.4: 0.22 },
                9: { 0.25: 0.275, 0.3: 0.268, 0.35: 0.268, 0.4: 0.265 },
                12: { 0.25: 0.298, 0.3: 0.298, 0.35: 0.295, 0.4: 0.285 }
            };
        }
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