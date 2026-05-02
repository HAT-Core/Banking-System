import {useState, useEffect} from 'react';
import {Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, TextField, MenuItem, Select, FormControl, InputLabel, Alert} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import api from '../utils/api'; 

function TabPanel(props) {
  const {children, value, index, ...other} = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{pt: 4}}>{children}</Box>}
    </div>
  );
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    '& fieldset': {borderColor: 'rgba(255,255,255,0.1)'},
    '&:hover fieldset': {borderColor: 'rgba(96,165,250,0.4)'},
    '&.Mui-focused fieldset': {borderColor: '#60A5FA', borderWidth: 1},
  },
  '& .MuiInputLabel-root': {color: 'rgba(255,255,255,0.4)'},
  '& .MuiInputLabel-root.Mui-focused': {color: '#60A5FA'},
  '& .MuiSelect-icon': {color: 'rgba(255,255,255,0.5)'},
};

const PK_LOAN_TYPES = [
  {label: 'Personal Loan', value: 'personal_loan'},
  {label: 'Home Finance (Mortgage)', value: 'home_finance'},
  {label: 'Auto Finance', value: 'auto_finance'},
  {label: 'Business Finance', value: 'business_finance'},
  {label: 'Agricultural Finance', value: 'agri_finance'},
  {label: 'Education Loan', value: 'education_loan'},
  {label: 'SME Finance', value: 'sme_finance'},
];

export default function AdminCatalogs() {
  const [tabValue, setTabValue] = useState(0);

  const [banks, setBanks] = useState([]);
  const [billers, setBillers] = useState([]);
  const [loans, setLoans] = useState([]);

  const [newBank, setNewBank] = useState('');
  const [newBillerName, setNewBillerName] = useState('');
  const [newBillerCategory, setNewBillerCategory] = useState('');
  const [selectedLoan, setSelectedLoan] = useState('');
  const [newRate, setNewRate] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchBanks();
    fetchBillers();
    fetchLoans();
  }, []);

  const fetchBanks = async () => {
    try{
      const {data} = await api.get('/admin/catalogs/banks');
      setBanks(data);
    }
    catch (error){
      console.error("Failed to fetch banks", error);
    }
  };

  const fetchBillers = async () => {
    try{
      const {data} = await api.get('/admin/catalogs/billers');
      setBillers(data);
    }
    catch (error) {
      console.error("Failed to fetch billers", error);
    }
  };

  const fetchLoans = async () => {
    try{
      const {data} = await api.get('/admin/catalogs/loans');
      setLoans(data);
    }
    catch (error){
      console.error("Failed to fetch loans", error);
    }
  };

  const handleAddBank = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!newBank) return setErrorMsg('Bank name is required.');

    try{
      await api.post('/admin/catalogs/banks', {bankName: newBank});
      setNewBank('');
      setSuccessMsg(`Bank "${newBank}" successfully added.`);
      
      setTimeout(async () => {
        await fetchBanks();
      }, 500);
    }
    catch (error){
      setErrorMsg(error.response?.data?.message || 'Failed to add bank.');
    }
  };

  const handleAddBiller = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!newBillerName || !newBillerCategory) return setErrorMsg('Biller name and category are required.');

    try{
      await api.post('/admin/catalogs/billers', {name: newBillerName, category: newBillerCategory});
      setNewBillerName('');
      setNewBillerCategory('');
      setSuccessMsg(`Biller "${newBillerName}" successfully added.`);
      
      setTimeout(async () => {
        await fetchBillers();
      }, 500);
    }
    catch (error){
      setErrorMsg(error.response?.data?.message || 'Failed to add biller.');
    }
  };

  const handleUpdateRate = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!selectedLoan || !newRate) return setErrorMsg('Please select a loan type and enter a new rate.');

    try{
      await api.put(`/admin/catalogs/loans/${selectedLoan}`, {interestRate: parseFloat(newRate)});
      setNewRate('');
      setSelectedLoan('');
      setSuccessMsg('Loan interest rate successfully updated.');
      
      setTimeout(async () => {
        await fetchLoans();
      }, 500);
    }
    catch (error){
      setErrorMsg(error.response?.data?.message || 'Failed to update rate.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <Box>
      <Box sx={{mb: 4}}>
        <Typography sx={{fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5}}>System Catalogs</Typography>
        <Typography sx={{fontSize: 15, color: 'rgba(255,255,255,0.4)'}}>Manage partner banks, utility billers, and global financial rates.</Typography>
        
        {errorMsg && (
          <Alert severity="error" sx={{mt: 2, background: 'rgba(239,68,68,0.05)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)', '& .MuiAlert-icon': {color: '#F87171'}}}>
            {errorMsg}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{mt: 2, background: 'rgba(74,222,128,0.1)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.3)', '& .MuiAlert-icon': {color: '#4ADE80'}}}>
            {successMsg}
          </Alert>
        )}
      </Box>

      <Box sx={{borderBottom: 1, borderColor: 'rgba(255,255,255,0.05)'}}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          sx={{
            '& .MuiTabs-indicator': {backgroundColor: '#60A5FA', height: 3, borderRadius: '3px 3px 0 0'},
            '& .MuiTab-root': {textTransform: 'none', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.4)', minHeight: 60},
            '& .Mui-selected': {color: '#60A5FA !important'},
          }}
        >
          <Tab icon={<AccountBalanceRoundedIcon sx={{mr: 1, mb: '0 !important'}} />} iconPosition="start" label="Supported Banks" />
          <Tab icon={<ReceiptLongRoundedIcon sx={{mr: 1, mb: '0 !important'}} />} iconPosition="start" label="Registered Billers" />
          <Tab icon={<PercentRoundedIcon sx={{mr: 1, mb: '0 !important'}} />} iconPosition="start" label="Loan Rates" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{display: 'flex', gap: 2, mb: 4, background: 'rgba(20,20,20,0.4)', p: 3, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'}}>
          <TextField label="Bank Name" value={newBank} onChange={(e) => setNewBank(e.target.value)} fullWidth size="small" sx={inputSx} />
          <Button onClick={handleAddBank} variant="contained" startIcon={<AddRoundedIcon />} sx={{background: '#60A5FA', color: '#0E0E0E', fontWeight: 700, px: 4, borderRadius: '10px', textTransform: 'none', whiteSpace: 'nowrap', '&:hover': {background: '#93C5FD'}}}>
            Add Bank
          </Button>
        </Box>
        <TableContainer sx={{background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden'}}>
          <Table>
            <TableHead sx={{background: 'rgba(0,0,0,0.4)'}}>
              <TableRow>
                <TableCell sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)'}}>ID</TableCell>
                <TableCell sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)'}}>Bank Name</TableCell>
                <TableCell align="right" sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)'}}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{color: 'rgba(255,255,255,0.4)', py: 4, borderBottom: 'none'}}>No banks registered.</TableCell>
                </TableRow>
              ) : (
                banks.map((bank) => (
                  <TableRow key={bank.bank_id} sx={{'&:hover': {background: 'rgba(255,255,255,0.02)'}}}>
                    <TableCell sx={{color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.02)'}}>#{bank.bank_id}</TableCell>
                    <TableCell sx={{color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.02)'}}>{bank.bank_name}</TableCell>
                    <TableCell align="right" sx={{borderBottom: '1px solid rgba(255,255,255,0.02)'}}>
                      <Box sx={{display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', background: 'rgba(74,222,128,0.1)', color: '#4ADE80', fontSize: 12, fontWeight: 600, textTransform: 'uppercase'}}>
                        Active
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{display: 'flex', gap: 2, mb: 4, background: 'rgba(20,20,20,0.4)', p: 3, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'}}>
          <TextField label="Biller Name" value={newBillerName} onChange={(e) => setNewBillerName(e.target.value)} fullWidth size="small" sx={inputSx} />
          <FormControl fullWidth size="small" sx={inputSx}>
            <InputLabel>Category</InputLabel>
            <Select value={newBillerCategory} label="Category" onChange={(e) => setNewBillerCategory(e.target.value)} MenuProps={{PaperProps: {sx: {bgcolor: '#1A1A1A', color: '#fff'}}}}>
              <MenuItem value="government">Government</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={handleAddBiller} variant="contained" startIcon={<AddRoundedIcon />} sx={{background: '#60A5FA', color: '#0E0E0E', fontWeight: 700, px: 4, borderRadius: '10px', textTransform: 'none', whiteSpace: 'nowrap', '&:hover': {background: '#93C5FD'}}}>
            Add Biller
          </Button>
        </Box>
        <TableContainer sx={{background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden'}}>
          <Table>
            <TableHead sx={{background: 'rgba(0,0,0,0.4)'}}>
              <TableRow>
                <TableCell sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)'}}>ID</TableCell>
                <TableCell sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)'}}>Biller Name</TableCell>
                <TableCell align="right" sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)'}}>Category</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {billers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{color: 'rgba(255,255,255,0.4)', py: 4, borderBottom: 'none'}}>No billers registered.</TableCell>
                </TableRow>
              ) : (
                billers.map((biller) => (
                  <TableRow key={biller.biller_id} sx={{'&:hover': {background: 'rgba(255,255,255,0.02)'}}}>
                    <TableCell sx={{color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.02)'}}>#{biller.biller_id}</TableCell>
                    <TableCell sx={{color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.02)'}}>{biller.name}</TableCell>
                    <TableCell align="right" sx={{borderBottom: '1px solid rgba(255,255,255,0.02)'}}>
                      <Box sx={{display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', background: biller.category === 'government' ? 'rgba(192,132,252,0.1)' : 'rgba(251,191,36,0.1)', color: biller.category === 'government' ? '#C084FC' : '#FBBF24', fontSize: 12, fontWeight: 600, textTransform: 'capitalize'}}>
                        {biller.category}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{display: 'flex', gap: 2, mb: 4, background: 'rgba(20,20,20,0.4)', p: 3, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', alignItems: 'center'}}>
          <FormControl fullWidth size="small" sx={inputSx}>
            <InputLabel>Select Loan Type</InputLabel>
            <Select value={selectedLoan} label="Select Loan Type" onChange={(e) => setSelectedLoan(e.target.value)} MenuProps={{PaperProps: {sx: {bgcolor: '#1A1A1A', color: '#fff'}}}}>
              {loans.length > 0
                ? loans.map((loan) => (
                    <MenuItem key={loan.loan_type_id} value={loan.loan_type_id}>{loan.type_name}</MenuItem>
                  ))
                : PK_LOAN_TYPES.map((lt) => (
                    <MenuItem key={lt.value} value={lt.value}>{lt.label}</MenuItem>
                  ))
              }
            </Select>
          </FormControl>
          <TextField label="New Interest Rate (%)" type="number" value={newRate} onChange={(e) => setNewRate(e.target.value)} fullWidth size="small" sx={inputSx} />
          <Button onClick={handleUpdateRate} variant="contained" startIcon={<SaveRoundedIcon />} sx={{background: '#60A5FA', color: '#0E0E0E', fontWeight: 700, px: 3, py: 1.1, borderRadius: '10px', textTransform: 'none', whiteSpace: 'nowrap', minWidth: 'fit-content', '&:hover': {background: '#93C5FD'}}}>
            Update Rate
          </Button>
        </Box>
        <TableContainer sx={{background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden'}}>
          <Table>
            <TableHead sx={{background: 'rgba(0,0,0,0.4)'}}>
              <TableRow>
                <TableCell sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)'}}>ID</TableCell>
                <TableCell sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)'}}>Loan Product</TableCell>
                <TableCell sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)'}}>Max Term</TableCell>
                <TableCell align="right" sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)'}}>Current Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{color: 'rgba(255,255,255,0.4)', py: 4, borderBottom: 'none'}}>No loan rates configured.</TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => (
                  <TableRow key={loan.loan_type_id} sx={{'&:hover': {background: 'rgba(255,255,255,0.02)'}}}>
                    <TableCell sx={{color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.02)'}}>#{loan.loan_type_id}</TableCell>
                    <TableCell sx={{color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.02)'}}>{loan.type_name}</TableCell>
                    <TableCell sx={{color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.02)'}}>Up to {loan.max_years} years</TableCell>
                    <TableCell align="right" sx={{borderBottom: '1px solid rgba(255,255,255,0.02)'}}>
                      <Typography sx={{color: '#60A5FA', fontWeight: 800, fontSize: 16}}>{loan.interest_rate}%</Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Box>
  );
}