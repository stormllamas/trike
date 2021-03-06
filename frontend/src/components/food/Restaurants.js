import React, { Fragment, useEffect, useState } from 'react'
import { HashLink as Link } from 'react-router-hash-link';
import { Redirect, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types'
import { connect } from 'react-redux';

import RestaurantItem from '../food/RestaurantItem'
import Preloader from '../../components/common/Preloader'

import { getAllSellers, getSellers, getCategories, updateSellersQuery, setCuisine, clearCuisine, setKeywords, clearKeywords } from '../../actions/logistics'


const Restaurants = ({
  logistics: {
    categoriesLoading, categories,

    allSellers, allSellersLoading,

    sellersLoading, moreSellersLoading,
    sellers,

    cuisineFilter, keywordsFilter
  },
  updateSellersQuery,
  getAllSellers,
  getSellers, getCategories,
  setCuisine, clearCuisine,
  setKeywords, clearKeywords
}) => {
  const history = useHistory()
  const query = new URLSearchParams(history.location.search);

  const [search, setSearch] = useState('')

  // Determine if cusine is active or not
  const activeCuisine = c => {
    let active = false
    const cuisineQuery = query.get('cuisine')
    if (cuisineQuery) {
      cuisineQuery.split('--').forEach(q => {
        c === q.replaceAll('-', ' ').replaceAll('and', '&') && (active = true)
      })
    }
    return active
  }

  const setQuery = (query, filter, set) => {
    query.split('--').forEach(q => {
      filter !== q && set({ cuisine: q.replaceAll('-', ' ').replaceAll('and', '&'), history })
    })
  }

  const onSubmit = e => {
    e.preventDefault();
    setKeywords(search),
    updateSellersQuery(history);
  }
  
  useEffect(() => {
    getCategories({
      categoryQueries: [
        'Cuisine'
      ]
    })

    const keywordsQuery = query.get('keywords')
    const cuisineQuery = query.get('cuisine')
    if (cuisineQuery) {
      setQuery(cuisineQuery, cuisineFilter, setCuisine)
    } else {
      clearCuisine();
    }
    if (keywordsQuery) {
      setSearch(keywordsQuery.replaceAll('-', ' ').replaceAll('and', '&'))
      setKeywords(keywordsQuery.replaceAll('-', ' ').replaceAll('and', '&'))
    } else {
      clearKeywords();
    }
  }, []);
  
  useEffect(() => {
    if (!sellersLoading, !categoriesLoading, !allSellersLoading) {
      $('.loader').fadeOut();
      $('.middle-content').fadeIn();
      const autoCompleteData = {}
      allSellers.forEach(seller => {
        autoCompleteData[`${seller.name}`] = null
      })
      $('input.autocomplete').autocomplete({
        data: autoCompleteData,
        onAutocomplete: e => {
          setSearch(e)
          setKeywords(e),
          updateSellersQuery(history);
        }
      });
    } else {
      $('.loader').show();
      $('.middle-content').hide();
    }
  }, [sellersLoading, categoriesLoading, allSellersLoading]);
  
  useEffect(() => {
    getAllSellers()
    getSellers({
      getMore: false,
    })
    setSearch(keywordsFilter)
  }, [cuisineFilter, keywordsFilter]);
  
  return (
    <Fragment>
      <section className="section-seller-search mb-0">
        <div className="container">
          <div className="row mb-0">
            <div className="col s12">
              <form noValidate onSubmit={onSubmit}>
                <div className="input-field">
                  <i className="material-icons prefix">search</i>
                  <input type="text" id="autocomplete-input" autoComplete="off" placeholder="Search a Restaurant" value={search} className="autocomplete" onChange={e => setSearch(e.target.value)}/>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-cuisines list-slider pt-0">
        <div className="container">
          <div className="row">
            <h5 className="mb-4 mt-0">Food Categories</h5>
            <div className="flex-row">
              {!categoriesLoading ? (
                categories.map(category => (
                  <div key={category.id} className={`flex-col center mb-2 waves-effect waves-grey rad-2 ${activeCuisine(category.name) && 'green'}`} onClick={() => {
                      setCuisine({ cuisine: category.name })
                      updateSellersQuery(history);
                    }}>
                    <div to="/" className="list-img circle bg-cover grey" style={{ backgroundImage: `url(${category.thumbnail})` }}></div>
                    <div to="/" className={`grey-text mt-1`}>{category.name}</div>
                  </div>
                ))
              ) : undefined}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-restaurants">
        <div className="container">
          <h5 className="mb-4">All Restaurants</h5>
          <ul className="flex">
            {!sellersLoading ? (
              sellers.results.map((seller, index) => (
                <RestaurantItem key={seller.id} seller={seller} sellers={sellers} index={index} sellersLoading={sellersLoading} />
              ))
            ) : undefined}
          </ul>
          {moreSellersLoading || sellersLoading ? (
            <div className="flex-col center relative preloader-wrapper">
              <Preloader color="green" size="small" adds=""/>
            </div>
          ) : undefined}
        </div>
      </section>
    </Fragment>
  )
}

Restaurants.propTypes = {
  getAllSellers: PropTypes.func.isRequired,
  getSellers: PropTypes.func.isRequired,
  getCategories: PropTypes.func.isRequired,
  updateSellersQuery: PropTypes.func.isRequired,
  setCuisine: PropTypes.func.isRequired,
  clearCuisine: PropTypes.func.isRequired,
  setKeywords: PropTypes.func.isRequired,
  clearKeywords: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  logistics: state.logistics,
});

export default connect(mapStateToProps, { getAllSellers, getSellers, getCategories, updateSellersQuery, setCuisine, clearCuisine, setKeywords, clearKeywords })(Restaurants);